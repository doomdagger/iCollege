/**
 * Created by psicat on 2015/2/22.
 */
var should          = require('should'),
    Promise         = require('bluebird'),
    testUtils       = require('../utils'),

    Settings         = require('../../models').Settings,

// Thing we are testing
// Original functions are not Promise-based, need promisify to run our unit test
//    versioning      = require('../../server/data/versioning'),
    versioning      = Promise.promisify(require('../../server/data/versioning')),
    defaultSettings = require('../../server/data/default-settings.json');
// storing current environment


describe('Versioning', function () {

    // keep database clean
    // 这个函数其实是在调用\data\migration的reset函数。目测目前的代码是好用的。
    // 但是目前运行不出来，只能目测了。
    before(testUtils.teardown());
    afterEach(testUtils.teardown());

    before(function () {
        should.exist(versioning);
    });

    describe('getDefaultDatabaseVersion', function () {
        it('should return default database version', function (done) {
            versioning.getDefaultDatabaseVersionAsync().then(function (result) {
                result.should.equals(defaultSettings.core.databaseVersion.defaultValue);
            }).catch(done);
        });
    });

    describe('getDatabaseVersion', function () {
        it('should return database version in settings', function (done) {
            // 每次开始测试时数据库应该是空的
            // 我们需要先存入一个值
            var settings = new Settings({
                'uuid': 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                'key': 'databaseVersion',
                'value': '001',
                'type': 'core'
            });
            settings.save();
            // test start
            versioning.getDatabaseVersionAsync().then(function (result) {
                result.should.equals(settings.value);
            }).catch(done);
        });
    });

    describe('setDatabaseVersion', function () {
        it('should set databaseVersion to default value', function (done) {
            // 这个函数是把数据库中的值设为默认值
            // 首先向数据库存入一个不同的值
            var settings = new Settings({
                'uuid': 'ffffffff-ffff-ffff-ffff-ffffffffffff',
                'key': 'databaseVersion',
                'value': '100',
                'type': 'core'
            });
            settings.save();
            // test start
            versioning.setDatabaseVersionAsync().then(function () {
                Settings.find({'key': 'databaseVersion'}).value.should.equals(defaultSettings.core.databaseVersion.defaultValue);
            }).catch(done);
        });
    });
});