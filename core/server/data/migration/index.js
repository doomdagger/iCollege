/**
 * # Database Migration
 * Database migration after database updates.
 * Updated by Lu Wanbo on 2015/2/18
 */
var _               = require('lodash'),
    Promise          = require('bluebird'),
    path             = require('path'),
    fs               = require('fs'),
    errors           = require('../../errors'),

    versioning       = require('../versioning'),
    Settings         = require('../../models/settings').Settings,
    fixtures         = require('../fixtures'),
    schema           = require('../schema').collections,
    dataExport       = require('../export'),
    utils            = require('../utils'),
    config           = require('../../config'),
    sequence         = require('../../utils/sequence'),

    schemaCollections = _.keys(schema),

    init,
    reset,
    migrateUp,
    migrateUpFreshDb,
    safeReset;


logInfo = function logInfo(message) {
    errors.logInfo('migration', message);
};

/**
 * ## backupDatabase
 * Backup data into a json file
 * @returns {*}
 */
backupDatabase = function backupDatabase() {
    logInfo('Creating database backup...');
    return dataExport().then(function (data) {
        // Write data into a file
        return dataExport.fileName().then(function (fileName) {
            // Get full path of exported data backup file
            fileName = path.resolve(config.core.contentPath + '/data/' + fileName);

            return Promise.promisify(fs.writeFile)(fileName, JSON.stringify(data)).then(function () {
                logInfo('Database backup is completed. Data is written to: ' + fileName);
            });
        })
    })
};

/**
 * ## init
 * Check for whether data is needed to be bootstrapped or not
 * @returns {*}
 */
init = function () {
    var self = this;
    // There are 4 possibilities:
    // 1. The database exists and is up-to-date
    // 2. The database exists but is out of date
    // 3. The database exists but the currentVersion setting does not or cannot be understood
    // 4. The database has not yet been created
    return versioning.getDatabaseVersion().then(function (databaseVersion) {
        var defaultVersion = versioning.getDefaultDatabaseVersion();

        if (databaseVersion < defaultVersion) {
            // 2. The database exists but is out of date
            logInfo('Current database is out of date.' +
                'Current version: ' + databaseVersion +  ', latest version: ' + defaultVersion + '. Upgrading...');
            // Migrate to latest version
            return self.migrateUp().then(function () {
                // Finally update the databases current version
                return versioning.setDatabaseVersion();
            });
        }

        if (databaseVersion === defaultVersion) {
            // 1. The database exists and is up-to-date
            logInfo('Your database is already up-to-date. Current database version is: ' + databaseVersion);
            return when.resolve();
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
                return Settings.populateDefaults();
            });
        });
    });
};


/**
 * ## migrateUp
 * Upgrade current database to new version one
 * @returns {*}
 */
migrateUp = function () {
    // 实验证明，在进行数据存储时，目标实体的多余值会被自动抛弃
    // 也就是说我们*应该*不用考虑集合结构改变产生的冗余数据的问题

    // todo: 处理旧数据少key的情况
    return Promise.promisify(function () {

    }).then(function () {
        // 如果以后有重大的版本升级导致需要添加更多的fixture
        // 应该在这里进行处理
        // 由于升级导致需要重置设置的话，也应该在这里处理。
    });
};

module.exports = {
    init: init,
    reset: reset,
    safeReset: safeReset,
    migrateUp: migrateUp,
    migrateUpFreshDb: migrateUpFreshDb
};
