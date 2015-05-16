/*globals describe, before, beforeEach, afterEach, it */
/*jshint expr:true*/
var testUtils   = require('../utils/index'),
    should      = require('should'),
    sinon       = require('sinon'),
    Promise     = require('bluebird'),
    assert      = require('assert'),
    _           = require('lodash'),
    rewire      = require('rewire'),
    mongoose   = require('mongoose'),

    // Stuff we are testing
    config          = rewire('../../server/config'),
    defaultConfig   = rewire('../../../config.example')[process.env.NODE_ENV],
    migration       = rewire('../../server/data/migration'),
    exporter        = require('../../server/data/export'),
    importer        = require('../../server/data/import'),
    DataImporter    = require('../../server/data/import/data-importer'),
    utils           = require('../../server/data/utils'),

    db,
    sandbox = sinon.sandbox.create(),
    userData = {
        _id: mongoose.Types.ObjectId('000000002222200000000000'),
        name: 'Lite Bloggs',
        nickname: 'Little Joe',
        slug: 'lite-bloggs',
        email: 'jbloggs@example.com',
        password: '$2a$10$n1ufCdsbGYgH5ay0miO/a.yNMkqncVOl4FbhNFHe7nsPqAqoWYEfu',
        uuid: 'c51a9ee0-dfb3-4d78-9ff1-771bee098fb4',
        apps: [],
        permissions: [],
        roles: [ '222222222222222222222222' ],
        friends: [],
        circles: [],
        groups: [],
        updated_at: 1388318310794,
        created_at: 1388318310794,
        settings: { language: 'zh_CN', profile_visibility: 'friends_only' },
        login_status: 'offline',
        status: 'inactive',
        tags: [],
        location: [],
        website: 'http://blog.dnlyc.com',
        birth_date: 1388318310794,
        gender: 'unknown',
        signature: 'I like iCollege',
        bio: 'I like iCollege',
        credit: 0
    };

//Tests in here do an import for each test
describe('Import', function () {
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    afterEach(function () {
        sandbox.restore();
    });

    should.exist(exporter);
    should.exist(importer);

    describe('Resolves', function () {
        beforeEach(testUtils.setup('settings'));
        beforeEach(function () {
            var newConfig = _.extend(config, defaultConfig);

            migration.__get__('config', newConfig);
            config.set(newConfig);
            db = config.database.db;
        });

        it('resolves DataImporter', function (done) {
            var importStub = sandbox.stub(DataImporter, 'importData', function () {
                    return Promise.resolve();
                }),
                fakeData = {meta : {version : '000'}, test: true};

            importer.doImport(fakeData).then(function () {
                importStub.calledWith(fakeData).should.equal(true);

                importStub.restore();

                done();
            }).catch(done);
        });
    });

    describe('DataImporter', function () {
        before(function ()  {
            db = config.database.db;
        });
        beforeEach(testUtils.setup('roles', 'owner', 'settings'));

        should.exist(DataImporter);

        it('imports data from 000', function (done) {
            var exportData;

            testUtils.fixtures.loadExportFixture('export-000').then(function (exported) {
                exportData = exported;

                return importer.doImport(exportData);
            }).then(function () {
                // Grab the data from tables
                return Promise.all([
                    utils.findDocuments('users'),
                    utils.findDocuments('permissions'),
                    utils.findDocuments('settings')
                ]);
            }).then(function (importedData) {
                should.exist(importedData);

                importedData.length.should.equal(3, 'Did not get data successfully');

                var users = importedData[0],
                    permissions = importedData[1],
                    settings = importedData[2];

                // we always have 1 user, the owner user we added
                users.length.should.equal(1, 'There should only be one user');
                // import no longer requires all data to be dropped, and adds posts
                permissions.length.should.equal(exportData.data.permissions.length, 'Wrong number of permissions');

                // test settings
                settings.length.should.be.above(0, 'Wrong number of settings');
                _.findWhere(settings, {key: 'databaseVersion'}).value.should.equal('000', 'Wrong database version');

                done();
            }).catch(done);
        });


        it('recover imports data, from 001', function (done) {
            var exportData,
                timestamp = 1349928000000;

            testUtils.fixtures.loadExportFixture('export-001').then(function (exported) {
                exportData = exported;

                // Modify timestamp data for testing
                exportData.data.posts[0].created_at = timestamp;
                exportData.data.posts[0].published_at = timestamp;

                return utils.insertDocuments('users', userData);

            }).then(function () {
                return importer.doImport(exportData);
            }).then(function () {
                // Grab the data from tables
                return Promise.all([
                    utils.findDocuments('users'),
                    utils.findDocuments('posts'),
                    utils.findDocuments('settings')
                ]);
            }).then(function (importedData) {
                should.exist(importedData);

                importedData.length.should.equal(3, 'Did not get data successfully');

                var users = importedData[0],
                    posts = importedData[1],
                    settings = importedData[2];

                // we always have 1 user, the default user we added
                users.length.should.equal(2, 'There should be two users');

                // import no longer requires all data to be dropped, and adds posts
                posts.length.should.equal(exportData.data.posts.length, 'Wrong number of posts');

                // test settings
                settings.length.should.be.above(0, 'Wrong number of settings');
                _.findWhere(settings, {key: 'databaseVersion'}).value.should.equal('000', 'Wrong database version');

                // Ensure imported post retains set timestamp
                assert.equal(new Date(posts[0].created_at).getTime(), timestamp);
                assert.equal(new Date(posts[0].published_at).getTime(), timestamp);

                done();
            }).catch(done);
        });

        it('import invalid post data from 002 and rollback database', function (done) {
            var exportData;

            testUtils.fixtures.loadExportFixture('export-002').then(function (exported) {
                exportData = exported;

                // change source_category to invalid enum
                exportData.data.posts[0].source_category = 'test invalid value';

                return importer.doImport(exportData);
            }).then(function () {

                utils.collectionNames().then(function (collectionNames) {

                    var res = _.map(collectionNames, function (collectionName) {
                        return utils.findDocuments(collectionName);
                    });

                    return Promise.all(res).then(function (importedData) {

                        should.exist(importedData);

                        var documents = _.filter(importedData, function (data) {
                            return !_.isEmpty(data);
                        });
                        documents.length.should.equal(3, 'Did not get data successfully');

                        done();
                    });

                });

            }).catch(done);
        });

        it('import invalid post data from 002 and rollback database and recover user data', function (done) {
            var exportData, userBeforeResult;


            utils.insertDocuments('users', userData).then(function () {
                //find document before import data file
                return utils.findDocuments('users');
            }).then(function (beforeResult) {
                userBeforeResult = beforeResult;
                return testUtils.fixtures.loadExportFixture('export-002');
            }).then(function (exported) {

                exportData = exported;

                // change source_category to invalid enum
                exportData.data.posts[0].source_category = 'test invalid value';

                return importer.doImport(exportData);

            }).then(function () {
                //find document before after roll back
                return utils.findDocuments('users');

            }).then (function (afterResult) {

                userBeforeResult.should.eql(afterResult);
                done();

            }).catch(done);
        });

        it('import invalid database version file from 004', function (done) {
            testUtils.fixtures.loadExportFixture('export-004').then(function (exported) {
                return importer.doImport(exported);

            }).then (function (err) {
                err.message.should.eql('Invalid Data File version.');
                done();
            });
        });

    });
});
