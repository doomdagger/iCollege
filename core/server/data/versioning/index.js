/**
 * Database versioning
 * Get Set database version
 * Created by Li He on 2014/7/25.
 */

var _               = require('lodash'),
    errors          = require('../../errors'),
    mongoose        = require('mongoose'),
    Setting         = require('../../models').Setting,

    defaultSettings = require('../default-settings'),

//    initialVersion  = '000',
    defaultDatabaseVersion;

// Default Database Version
// The migration version number according to the hardcoded default settings
// This is the version the database should be at or migrated to
function getDefaultDatabaseVersion() {
    if (!defaultDatabaseVersion) {
        // This be the current version according to the software
        defaultDatabaseVersion = defaultSettings.core.databaseVersion.defaultValue;
    }

    return defaultDatabaseVersion;
}

// Database Current Version
// The migration version number according to the database
// This is what the database is currently at and may need to be updated
function getDatabaseVersion() {
    // TODO: implement this method
    return "000";
}

function setDatabaseVersion() {
    // TODO: implement this method
}

module.exports = {
    getDefaultDatabaseVersion: getDefaultDatabaseVersion,
    getDatabaseVersion: getDatabaseVersion,
    setDatabaseVersion: setDatabaseVersion
};