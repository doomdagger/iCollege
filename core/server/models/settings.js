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
    Settings,
    Setting;


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

}, {
    //methods here

    defaults: function() {
        return {
            uuid: node_uuid.v4(),
            type: 'core'
        }
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