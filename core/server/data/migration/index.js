var _               = require('lodash'),
    when            = require('when'),
    path            = require('path'),
    fs              = require('fs'),
    nodefn          = require('when/node'),
    errors          = require('../../errors'),
    sequence        = require('when/sequence'),

    versioning      = require('../versioning'),
    Setting        = require('../../models/settings').Setting,
    fixtures        = require('../fixtures'),
    schema          = require('../schema').collections,
    dataExport      = require('../export'),
    utils           = require('../utils'),
    config          = require('../../config'),

    schemaCollections    = _.keys(schema),

    init,
    reset,
    migrateUp,
    migrateUpFreshDb,
    safeReset;



// Check for whether data is needed to be bootstrapped or not
init = function () {
    var self = this;
    // There are 4 possibilities:
    // 1. The database exists and is up-to-date
    // 2. The database exists but is out of date
    // 3. The database exists but the currentVersion setting does not or cannot be understood
    // 4. The database has not yet been created
    return versioning.getDatabaseVersion().then(function (databaseVersion) {
        var defaultVersion = versioning.getDefaultDatabaseVersion();
        if (databaseVersion === defaultVersion) {
            // 1. The database exists and is up-to-date
            return when.resolve();
        }
        if (databaseVersion < defaultVersion) {
            // 2. The database exists but is out of date
            // Migrate to latest version
            return self.migrateUp().then(function () {
                // Finally update the databases current version
                return versioning.setDatabaseVersion();
            });
        }
        if (databaseVersion > defaultVersion) {
            // 3. The database exists but the currentVersion setting does not or cannot be understood
            // In this case we don't understand the version because it is too high
            errors.logErrorAndExit(
                'Your database is not compatible with this version of iCollege',
                'You will need to create a new database'
            );
        }
    }, function (err) {
        if (err.message || err === 'No Database version could be found, settings collection does not exist?') {
            // 4. The database has not yet been created
            // Bring everything up from initial version.
            return self.migrateUpFreshDb();
        }
        // 3. The database exists but the currentVersion setting does not or cannot be understood
        // In this case the setting was missing or there was some other problem
        errors.logErrorAndExit('There is a problem with the database', err.message || err);
    });
};

// ### Reset
// Delete all tables from the database in reverse order
// **only if all collections in schema.js exist! we can safely use this function**
reset = function () {

    var collections = _.map(schemaCollections, function (collection) {
        return function () {
            return utils.dropCollection(collection);
        };
    }).reverse();


    return sequence(collections);
};

// ### SafeReset
// Delete all tables from the database
// only delete collections exist in the database
safeReset = function () {
    return utils.safeDropCollections();
};

// Only do this if we have no database at all
// no version, no all; delete all collections in this database
migrateUpFreshDb = function () {

    var collections = _.map(schemaCollections, function (collection) {
        return function () {
            return utils.createCollection(collection);
        };
    });

    // drop all exists!
    return utils.safeDropCollections().then(function () {
        // sequence creations
        return sequence(collections).then(function () {
            // Load the fixtures
            return fixtures.populateFixtures().then(function () {
                // Initialise the default settings
                return Setting.populateDefaults();
            });
        });
    });
};


/**
 * Backup data into a json file
 * @returns {*}
 */
function backupDatabase() {
    return dataExport().then(function (exportedData) {
        // Save the exported data to the file system for download
        var fileName = path.resolve(config().paths.contentPath + '/data/exported-' + (new Date().getTime()) + '.json');

        return nodefn.call(fs.writeFile, fileName, JSON.stringify(exportedData));
    });
}

// Migrate from a specific version to the latest
migrateUp = function () {
    // TODO: Too simple logic for migrating up
    return backupDatabase().then(function () {
        return migrateUpFreshDb();
    });
};

module.exports = {
    init: init,
    reset: reset,
    safeReset: safeReset,
    migrateUp: migrateUp,
    migrateUpFreshDb: migrateUpFreshDb
};
