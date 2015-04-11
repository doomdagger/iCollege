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
    },

    validateSettings: function () {
        return validation.validateSettings(getDefaultSettings(), this);
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


    populateDefault: function (key) {
        if (!getDefaultSettings()[key]) {
            return Promise.reject(new errors.NotFoundError('Unable to find default setting: ' + key));
        }

        return this.findOneAsync({key: key}).then(function (foundSetting) {
            if (foundSetting) {
                return foundSetting;
            }

            var defaultSetting = _.clone(getDefaultSettings()[key]);
            defaultSetting.uuid = uuid.v4();
            defaultSetting.value = defaultSetting.defaultValue;

            return Settings.forge(defaultSetting, internal).saveAsync();
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
                    defaultSetting.uuid = uuid.v4();
                    insertOperations.push(Settings.forge(defaultSetting, internal).saveAsync());
                }
            });

            return Promise.all(insertOperations);
        });
    }

});

Settings = icollegeShelf.model('Settings', SettingSchema);

module.exports = {
    Settings: Settings
};
