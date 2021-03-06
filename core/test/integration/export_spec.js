/*globals describe, before, beforeEach, afterEach, it*/
/*jshint expr:true*/
var testUtils   = require('../utils/index'),
    should      = require('should'),
    sinon       = require('sinon'),
    Promise     = require('bluebird'),
    _           = require('lodash'),

    // Stuff we are testing
    versioning  = require('../../server/data/versioning/index'),
    exporter    = require('../../server/data/export/index'),
    sandbox = sinon.sandbox.create();

describe('Exporter', function () {
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    afterEach(function () {
        sandbox.restore();
    });
    beforeEach(testUtils.setup('default'));

    should.exist(exporter);

    it('exports data', function (done) {
        // Stub migrations to return 000 as the current database version
        var versioningStub = sandbox.stub(versioning, 'getDatabaseVersion', function () {
            return Promise.resolve('000');
        });

        exporter().then(function (exportData) {
            var tables = ['apps', 'circles', 'groups', 'messages', 'notifications',
                'permissions', 'posts', 'reposts', 'roles', 'settings', 'users'],
                dbVersionSetting;

            should.exist(exportData);

            should.exist(exportData.meta);
            should.exist(exportData.data);

            exportData.meta.version.should.equal('000');

            dbVersionSetting = _.findWhere(exportData.data.settings, {key: 'databaseVersion'});

            should.exist(dbVersionSetting);

            dbVersionSetting.value.should.equal('000');


            _.each(tables, function (name) {
                should.exist(exportData.data[name]);
            });
            // should not export sqlite data
            should.not.exist(exportData.data.sqlite_sequence);

            versioningStub.restore();
            done();
        }).catch(done);
    });

    it('export file name', function () {
        var datetime = (new Date()).toJSON().substring(0, 10);
        exporter.fileName().should.equal('icollege' + datetime + '.json');
    });
});
