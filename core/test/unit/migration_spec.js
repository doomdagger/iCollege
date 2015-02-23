/**
 * Created by psicat on 2015/2/23.
 */
var should          = require('should'),
    Promise         = require('bluebird'),
    testUtils       = require('../utils'),

    Settings         = require('../../models').Settings,

// Thing we are testing
    migration       = require('../../server/data/migration'),
    defaultSettings = require('../../server/data/default-settings.json');
// Storing current environment

describe('Migration', function () {

    // For make our unit test faster,
    // We should keep database clean after each test,
    // And save proper setting item(s) for different scenarios (if necessary).
    afterEach(testUtils.teardown());

    before(function () {
        should.exist(migration);
        new Settings({
            'uuid': 'ffffffff-ffff-ffff-ffff-fffffffffffa',
            'key': 'migrationUnitTestFlag',
            'value': true,
            'type': 'core'
        }).save();
    });

    describe('reset', function () {
        it('should clean up our database', function (done) {
            migration.reset().then(function () {
                Settings.findOneAsync({'key': 'migrationUnitTestFlag'}).value.should.equals(null);
            }).catch(done);
        });
    });

    describe('safeReset', function () {
        it('should clean up our database', function (done) {
            migration.reset().then(function () {
                Settings.findOneAsync({'key': 'migrationUnitTestFlag'}).value.should.equals(null);
            }).catch(done);
        });
    });

    describe('migrateUpFreshDb', function () {
        it('should create a database structure with fixtures', function (done) {
            return migration.migrateUpFreshDb().then(function () {
                // Database version should set to default while migrateUpFreshDb()
                Settings.findOneAsync({'key': 'databaseVersion'}).value.should.equals(defaultSettings.core.databaseVersion.defaultValue);
                // Former data should not exist
                Settings.findOneAsync({'key': 'migrationUnitTestFlag'}).value.should.equals(null);
            }).catch(done);
        });
    });

    // For now migrateUp() is empty. Tests skipped.

    describe('init', function () {
        // There are 4 possibilities:
        // 1. The database exists and is up-to-date
        // 2. The database exists but is out of date
        // 3. The database exists but the currentVersion setting does not or cannot be understood
        // 4. The database has not yet been created
        it('in scenario 1 should run without error', function (done) {
            return Promise.promisify(function () {
                return new Settings({
                    'uuid': 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                    'key': 'databaseVersion',
                    'value': defaultSettings.core.databaseVersion.defaultValue,
                    'type': 'core'
                }).save();
            }).then(function () {
                migration.init().then(function () {
                    // Former data should be exist
                    Settings.find({'key': 'migrationUnitTestFlag'}).value.should.equals(true);
                });
            }).catch(done);
        });

        it('in scenario 2 should upgrade database and set version to default', function (done) {
            return Promise.promisify(function () {
                return new Settings({
                    'uuid': 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                    'key': 'databaseVersion',
                    'value': defaultSettings.core.databaseVersion.defaultValue - 1,
                    'type': 'core'
                }).save();
            }).then(function () {
                migration.init().then(function () {
                    // Database version should set to default
                    Settings.find({'key': 'databaseVersion'}).value.should.equals(defaultSettings.core.databaseVersion.defaultValue);
                    // Former data should be exist
                    Settings.find({'key': 'migrationUnitTestFlag'}).value.should.equals(true);
                });
            }).catch(done);
        });

        it('in scenario 3 should be error reported while nothing changed in database', function (done) {
            return Promise.promisify(function () {
                return new Settings({
                    'uuid': 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                    'key': 'databaseVersion',
                    'value': '42',
                    'type': 'core'
                }).save();
            }).then(function () {
                migration.init().then(function () {
                    // Database version should as before
                    Settings.find({'key': 'databaseVersion'}).value.should.equals('42');
                    // Former data should be exist
                    Settings.find({'key': 'migrationUnitTestFlag'}).value.should.equals(true);
                });
            }).catch(done);
        });

        it('in scenario 4 should fresh database to default', function (done) {
            testUtils.teardown().then(function () {
                migration.init().then(function () {
                    // Database version should set to default while migrateUpFreshDb()
                    Settings.findOneAsync({'key': 'databaseVersion'}).value.should.equals(defaultSettings.core.databaseVersion.defaultValue);
                    // Former data should not exist
                    Settings.findOneAsync({'key': 'migrationUnitTestFlag'}).value.should.equals(null);
                })
            }).catch(done);
        });
    });
});