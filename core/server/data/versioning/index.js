/**
 * Database versioning
 * Get Set database version
 * Created by Li He on 2014/7/25.
 */

var _               = require('lodash'),
    errors          = require('../../errors'),
    Setting         = require('../../models').Setting,
    when            = require('when'),

    defaultSettings = require('../default-settings'),
    initialVersion  = '000',

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
    var found = when.defer();

    Setting.findOne({'key': 'databaseVersion'}, 'value', function(err, version){
        var databaseVersion;

        if (err) {
            found.reject(err);
            return;
        }
        if (isNaN(version.value)) {
            found.reject('Database version is not recognised');
            return;
        }

        databaseVersion = version.value;
        if (!databaseVersion || databaseVersion.length==0) {
            // we didn't get a response we understood, assume initialVersion
            databaseVersion = initialVersion;
        }

        found.resolve(databaseVersion);
    });

    return found.promise;
}

function setDatabaseVersion() {
    var updated = when.defer();

    Setting.update({key: 'databaseVersion'}, {value: defaultDatabaseVersion}, function(err, numberAffected){
        if (err) {
            updated.reject(err);
            return;
        }

        updated.resolve(numberAffected);
    });

    return updated.promise;
}

module.exports = {
    getDefaultDatabaseVersion: getDefaultDatabaseVersion,
    getDatabaseVersion: getDatabaseVersion,
    setDatabaseVersion: setDatabaseVersion
};