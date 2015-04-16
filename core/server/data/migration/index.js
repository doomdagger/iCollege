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
    models           = require('../../models'),
    fixtures         = require('../fixtures'),
    schema           = require('../schema').collections,
    dataExport       = require('../export'),
    utils            = require('../utils'),
    config           = require('../../config'),
    sequence         = require('../../utils/sequence'),

    schemaCollections = _.keys(schema),

    // private
    logInfo,
    populateDefaultSettings,
    backupDatabase,

    // public
    init,
    reset,
    migrateUp,
    migrateUpFreshDb,
    safeReset;


logInfo = function logInfo(message) {
    errors.logInfo('Migrations', message);
};

populateDefaultSettings = function populateDefaultSettings() {
    // Initialise the default settings
    logInfo('Populating default settings');
    return models.Settings.populateDefault('databaseVersion').then(function () {
        logInfo('Complete');
    });
};

/**
 * ## backupDatabase
 * Backup data into a json file
 * @returns {*}
 */
backupDatabase = function backupDatabase() {
    logInfo('Creating database backup...');
    return dataExport().then(function (exportedData) {
        // Write data into a file
        return dataExport.fileName().then(function (fileName) {
            // Get full path of exported data backup file
            fileName = path.resolve(config.paths.contentPath + '/data/' + fileName);

            return Promise.promisify(fs.writeFile)(fileName, JSON.stringify(exportedData)).then(function () {
                logInfo('Database backup is completed. Data is written to: ' + fileName);
            });
        });
    });
};

/**
 * ## init
 * Check for whether data is needed to be bootstrapped or not
 * @returns {*}
 */
init = function (tablesOnly) {
    tablesOnly = tablesOnly || false;

    var self = this;
    // There are 4 possibilities:
    // 1. The database exists and is up-to-date
    // 2. The database exists but is out of date
    // 3. The database exists but the currentVersion setting does not or cannot be understood
    // 4. The database has not yet been created
    return versioning.getDatabaseVersion().then(function (databaseVersion) {
        var defaultVersion = versioning.getDefaultDatabaseVersion();

        if (databaseVersion < defaultVersion || process.env.FORCE_MIGRATION) {
            // 2. The database exists but is out of date
            logInfo('Database upgrade required from version ' + databaseVersion + ' to ' +  defaultVersion);
            // Migrate to latest version
            return self.migrateUp(databaseVersion, defaultVersion).then(function () {
                // Finally update the databases current version
                return versioning.setDatabaseVersion({context: {internal: true}});
            });
        }

        if (databaseVersion === defaultVersion) {
            // 1. The database exists and is up-to-date
            logInfo('Up to date at version ' + databaseVersion);
            return;
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
            logInfo('Database initialisation required for version ' + versioning.getDefaultDatabaseVersion());
            return self.migrateUpFreshDb(tablesOnly);
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
migrateUpFreshDb = function (tablesOnly) {
    var collectionSequence,
        collections = _.map(schemaCollections, function (collection) {
            return function () {
                logInfo('Creating collection: ' + collection);
                return utils.createCollection(collection);
            };
        });
    logInfo('Creating tables...');
    collectionSequence = sequence(collections);

    if (tablesOnly) {
        return collectionSequence;
    }

    return collectionSequence.then(function () {
        return fixtures.populateFixtures();
    }).then(function () {
        return populateDefaultSettings();
    });
};


/**
 * ## migrateUp
 * Upgrade current database to new version one
 * TODO in the future, we may know how to write upgrade logic
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
