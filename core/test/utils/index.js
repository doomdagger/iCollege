var when          = require('when'),
    sequence      = require('when/sequence'),
    nodefn        = require('when/node'),
    _             = require('lodash'),
    fs            = require('fs-extra'),
    path          = require('path'),
    mongoose      = require('mongoose'),

    migration     = require("../../server/data/migration/"),
    settings      = require('../../server/models/settings').Setting,
    SettingsAPI   = require('../../server/api/settings'),
    permissions   = require('../../server/permissions'),
    dataProvider  = require('../../server/models'),
    config        = require('../../server/config'),

    initData,
    openCon,
    clearData,
    closeCon,
    teardown;

initData = function () {
    return migration.init();
};

openCon = function () {
    if (mongoose.connection.db) {
        return when.resolve();
    }
    return dataProvider.init();
};

clearData = function () {
    // we must always try to delete all tables
    return migration.safeReset();
};

/**
 * 除非有需要，无需用这个方法！！！
 * 无需使用！！！
 * @returns {*}
 */
closeCon = function () {
    var closed = when.defer();
    mongoose.connection.close(function () {
        closed.resolve();
    });
    return closed.promise;
};

teardown = function (done) {
    migration.reset().then(function () {
        done();
    }).catch(done);
};

module.exports = {
    initData: initData,
    clearData: clearData,
    openCon: openCon,
    closeCon: closeCon,
    teardown: teardown
};
