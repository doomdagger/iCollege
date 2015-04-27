// Settings Model

var icollegeShelf  = require('./base'),
    uuid           = require('node-uuid'),
    _              = require('lodash'),
    errors         = require('../errors'),
    Promise        = require('bluebird'),
    validation     = require('../data/validation'),
    internal       = {context: {internal: true}},

    SettingSchema,
    Settings,
    defaultSettings;


// For neatness, the defaults file is split into categories.
// It's much easier for us to work with it as a single level
// instead of iterating those categories every time
function parseDefaultSettings() {
    var defaultSettingsInCategories = require('../data/default-settings.json'),
        defaultSettingsFlattened = {};

    _.each(defaultSettingsInCategories, function (settings, categoryName) {
        _.each(settings, function (setting, settingName) {
            setting.type = categoryName;
            setting.key = settingName;

            defaultSettingsFlattened[settingName] = setting;
        });
    });

    return defaultSettingsFlattened;
}

function getDefaultSettings() {
    if (!defaultSettings) {
        defaultSettings = parseDefaultSettings();
    }

    return defaultSettings;
}

// Each setting is saved as a separate row in the database,
// but the overlying API treats them as a single key:value mapping
SettingSchema = icollegeShelf.schema('settings', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke

    defaults: function () {
        return {
            uuid: uuid.v4(),
            type: 'core'
        };
    }

}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    findOneAsync: function (conditions) {
        // Allow for just passing the key instead of attributes
        if (!_.isObject(conditions)) {
            conditions = {key: conditions};
        }
        return Promise.resolve(icollegeShelf.Model.findOneAsync.call(this, conditions));
    },

    edit: function (data, options) {
        var self = this;
        options = this.filterOptions(options, 'edit');

        if (!Array.isArray(data)) {
            data = [data];
        }

        return Promise.map(data, function (item) {
            // Accept an array of models as input
            if (item.toJSON) { item = item.toJSON(); }
            if (!(_.isString(item.key) && item.key.length > 0)) {
                return Promise.reject(new errors.ValidationError('Value in [settings.key] cannot be blank.'));
            }

            item = self.filterData(item);

            return Settings.updateAsync({key: item.key}, {value: item.value}, options).then(function (ret) {
                if (ret.nModified === 0) {
                    return Promise.reject(new errors.NotFoundError('Unable to find setting to update: ' + item.key));
                }
            }, errors.logAndThrowError);
        });
    },

    populateDefault: function (key) {
        if (!getDefaultSettings()[key]) {
            return Promise.reject(new errors.NotFoundError('Unable to find default setting: ' + key));
        }

        return this.findOneAsync({key: key}).then(function (foundSetting) {
            if (foundSetting) {
                return foundSetting;
            }

            var defaultSetting = _.clone(getDefaultSettings()[key]);
            defaultSetting.value = defaultSetting.defaultValue;

            return Settings.forge(defaultSetting).saveAsync(internal);
        });
    },

    populateDefaults: function () {
        return this.findAll().then(function (allSettings) {
            var usedKeys = allSettings.map(function (setting) { return setting.get('key'); }),
                insertOperations = [];

            _.each(getDefaultSettings(), function (defaultSetting, defaultSettingKey) {
                var isMissingFromDB = usedKeys.indexOf(defaultSettingKey) === -1;
                // Temporary code to deal with old databases with currentVersion settings
                if (defaultSettingKey === 'databaseVersion' && usedKeys.indexOf('currentVersion') !== -1) {
                    isMissingFromDB = false;
                }
                if (isMissingFromDB) {
                    defaultSetting.value = defaultSetting.defaultValue;
                    insertOperations.push(Settings.forge(defaultSetting).saveAsync(internal));
                }
            });

            return Promise.all(insertOperations);
        });
    }

}, {
    // #### Schema instance level
    initialize: function () {
        icollegeShelf.Schema.prototype.initialize.apply(this, arguments);

        // add validation for settings, hook in before validate
        this.pre('validate', this.validating);
    },

    // This 'this' is model instance level
    validating: function (next) {
        if (validation.validateSettings(getDefaultSettings(), this)) {
            return next();
        }
        errors.throwError(errors.ValidationError("Settings Validation Failed"));
    }
});

Settings = icollegeShelf.model('Settings', SettingSchema);

module.exports = {
    Settings: Settings
};
