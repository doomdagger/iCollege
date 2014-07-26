/**
 * Created by Li He on 2014/7/25.
 */
// # Settings API
// RESTful API for the Setting resource
var _            = require('lodash'),
    dataProvider = require('../models'),
    when         = require('when'),
    errors       = require('../errors'),

    //docName      = 'settings',
    settings,

    updateSettingsCache,
    settingsFilter,
    readSettingsResult,
    settingsResult,
    populateDefaultSetting,

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

    return dataProvider.Setting.findPromised({})
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
 * ## Settings API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
settings = {


};

module.exports = settings;
module.exports.updateSettingsCache = updateSettingsCache;

