/**
 * Created by Li He on 2014/7/25.
 */
// # Settings API
// RESTful API for the Setting resource
var _            = require('lodash'),
    dataProvider = require('../models'),
    when         = require('when'),
    config       = require('../config'),
    canThis      = require('../permissions').canThis,
    errors       = require('../errors'),
    utils        = require('./utils'),

    //docName      = 'settings',
    settings,

    updateSettingsCache,
    settingsFilter,
    readSettingsResult,
    settingsResult,
    canEditAllSettings,
    populateDefaultSetting,
    //hasPopulatedDefaults = false,

    /**
     * ## Cache
     * Holds cached settings
     * @private
     * @type {{}}
     */
    settingsCache = {};


/**
 * ### Update Settings Cache
 * Maintain the internal cache of the settings object
 * @public
 * @param settings
 * @returns {Settings}
 */
updateSettingsCache = function (settings) {
    settings = settings || {};

    if (!_.isEmpty(settings)) {
        _.map(settings, function (setting, key) {
            settingsCache[key] = setting;
        });

        return when(settingsCache);
    }

    return dataProvider.Setting.findAllPromised()
        .then(function (result) {
            settingsCache = readSettingsResult(result);

            return settingsCache;
        });
};

// ## Helpers

/**
 * ### Settings Filter
 * Filters an object based on a given filter object
 * @private
 * @param settings
 * @param filter
 * @returns {*}
 */
settingsFilter = function (settings, filter) {
    return _.object(_.filter(_.pairs(settings), function (setting) {
        if (filter) {
            return _.some(filter.split(','), function (f) {
                return setting[1].type === f;
            });
        }
        return true;
    }));
};


/**
 * ### Read Settings Result
 * @private
 * @param settingsModels
 * @returns {Settings}
 */
readSettingsResult = function (settingsModels) {

    return _.reduce(settingsModels, function (memo, member) {
        if (!memo.hasOwnProperty(member.key)) {
            memo[member.key] = member;
        }

        return memo;
    }, {});
};

/**
 * ### Settings Result
 * @private
 * @param settings
 * @param type
 * @returns {{settings: *}}
 */
settingsResult = function (settings, type) {
    var filteredSettings = _.values(settingsFilter(settings, type)),
        result = {
            settings: filteredSettings,
            meta: {}
        };

    if (type) {
        result.meta.filters = {
            type: type
        };
    }

    return result;
};

/**
 * ### Populate Default Setting
 * @private
 * @param key
 * @returns Promise(Setting)
 */
populateDefaultSetting = function (key) {
    // Call populateDefault and update the settings cache
    return dataProvider.Setting.populateDefault(key).then(function (defaultSetting) {
        // Process the default result and add to settings cache
        var readResult = readSettingsResult(defaultSetting);

        // Add to the settings cache
        return updateSettingsCache(readResult).then(function () {
            // Get the result from the cache with permission checks
            return defaultSetting;
        });
    }).catch(function (err) {
        errors.logError(err, "In populateDefaultSetting(key) in settings api");
        return when.reject(new errors.NotFoundError('Problem finding setting: ' + key));
    });
};

/**
 * ### Can Edit All Settings
 * Check that this edit request is allowed for all settings requested to be updated
 * @private
 * @param settingsInfo
 * @returns {*}
 * @param options
 */
canEditAllSettings = function (settingsInfo, options) {
    var checkSettingPermissions = function (setting) {
            if (setting.type === 'core' && !(options.context && options.context.internal)) {
                return when.reject(
                    new errors.NoPermissionError('Attempted to access core setting from external request')
                );
            }

            // pass key to validate request?
            return canThis(options.context).edit.setting(setting.key).catch(function () {
                return when.reject(new errors.NoPermissionError('You do not have permission to edit settings.'));
            });

        },
        checks = _.map(settingsInfo, function (settingInfo) {
            var setting = settingsCache[settingInfo.key];

            if (!setting) {
                // Try to populate a default setting if not in the cache
                return populateDefaultSetting(settingInfo.key).then(function (defaultSetting) {
                    // Get the result from the cache with permission checks
                    return checkSettingPermissions(defaultSetting);
                });
            }

            return checkSettingPermissions(setting);
        });

    return when.all(checks);
};

/**
 * ## Settings API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
settings = {


};

module.exports = settings;
module.exports.updateSettingsCache = updateSettingsCache;

