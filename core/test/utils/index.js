var when          = require('when'),
    sequence      = require('when/sequence'),
    nodefn        = require('when/node'),
    _             = require('lodash'),
    fs            = require('fs-extra'),
    path          = require('path'),
    mongoose      = require('mongoose'),
    dataProvider  = require('../../server/models'),
    migration     = require("../../server/data/migration/"),
    Setting      = require('../../server/models/settings').Setting;

function initData() {
    return migration.init();
}

function openCon() {
    if (mongoose.connection.db) {
        return when.resolve();
    }
    return dataProvider.init();
}

function clearData() {
    // we must always try to delete all tables
    return migration.safeReset();
}

/**
 * 除非有需要，无需用这个方法！！！
 * 无需使用！！！
 * @returns {*}
 */
function closeCon() {
    var closed = when.defer();
    mongoose.connection.close(function () {
        closed.resolve();
    });
    return closed.promise;
}


module.exports = {
    initData: initData,
    clearData: clearData,
    openCon: openCon,
    closeCon: closeCon
};
