/**
 * ## Setting Model
 * Created by Li He on 7/25/2014.
 */

var mongoose       = require('mongoose'),
    icollegeSchema = require('./base'),
    node_uuid      = require('node-uuid'),
    _              = require('lodash'),
    errors         = require('../errors'),
    when           = require('when'),
    validation     = require('../data/validation'),

    defaultSettings,
    Setting,
    Settings;


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


//Schema definition
Settings = icollegeSchema.extend('settings', {
    //statics here

    /**
     * Get Default Minimised Setting Entry
     * @returns {{uuid: *, type: string}}
     */
    'defaults': function () {
        return {
            uuid: node_uuid.v4(),
            type: 'core'
        };
    },

    /**
     * Populate specific key for default setting
     * @param key
     * @returns {*}
     */
    'populateDefault': function (key) {
        if (!getDefaultSettings()[key]) {
            return when.reject(new errors.NotFoundError('Unable to find default setting: ' + key));
        }

        return this.findOnePromised({ key: key }).then(function (foundSetting) {
            var defaultSetting,
                deferred;

            if (foundSetting) {
                return foundSetting;
            }

            defaultSetting = _.clone(getDefaultSettings()[key]);
            defaultSetting.value = defaultSetting.defaultValue;

            deferred = when.defer();
            new Setting({
                uuid: node_uuid.v4(),
                key: defaultSetting.key,
                value: defaultSetting.value,
                type: defaultSetting.type
            }).save(function (err, savedSetting) {
                if (err) {
                    deferred.reject(err);
                    return;
                }
                deferred.resolve(savedSetting);
            });
            return deferred.promise;
        });
    },

    /**
     * Populate default settings
     * @returns {*}
     */
    'populateDefaults': function () {

        return this.findPromised({}).then(function (allSettings) {
            var usedKeys = allSettings.map(function (setting) { return setting.key; }),
                insertOperations = [];

            _.each(getDefaultSettings(), function (defaultSetting, defaultSettingKey) {
                var isMissingFromDB = usedKeys.indexOf(defaultSettingKey) === -1;
                // Temporary code to deal with old databases with currentVersion settings

                if (isMissingFromDB) {
                    defaultSetting.value = defaultSetting.defaultValue;
                    insertOperations.push((function () {
                        var deferred = when.defer();
                        new Setting({
                            uuid: node_uuid.v4(),
                            key: defaultSetting.key,
                            value: defaultSetting.value,
                            type: defaultSetting.type
                        }).save(function (err, saved) {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }
                            deferred.resolve(saved);
                        });
                        return deferred.promise;
                    })());
                }
            });

            return when.all(insertOperations);
        });
    }


}, {
    //methods here

    /**
     * Validate a entry of setting
     * @returns {*}
     */
    'validateSetting': function () {
        var self = this;
        return when(validation.validateSettings(getDefaultSettings(), self));
    }


}, [
    //plugins here
]);

//Model definition
Setting = mongoose.model('Setting', Settings);

module.exports = {
    Setting: Setting,
    Settings: Settings
};