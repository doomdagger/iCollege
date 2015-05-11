/**
 * data import
 * Created by Li He on 2014/7/25.
 * Updated by (Lu Wanbo) on 2014/7/30.
 * Updated by Xie Wei on 2015/2/20.
 */


var Promise = require('bluebird'),
    utils   = require('./utils'),
    Transaction = require('../utils/transaction'),

    DataImporter;

DataImporter = function () {};

DataImporter.prototype.importData = function (data) {
    return this.doImport(data);
};

DataImporter.prototype.doImport = function (data) {
    var tableData = data.data,
        t = new Transaction();

    return Promise.resolve().then(function () {
        utils.importUsers(t, tableData.users);
    }).then(function () {
        utils.importApps(t, tableData.apps);
    }).then(function () {
        utils.importNotifications(t, tableData.notifications);
    }).then(function () {
        utils.importRoles(t, tableData.roles);
    }).then(function () {
        utils.importPermissions(t, tableData.permissions);
    }).then(function () {
        utils.importGroups(t, tableData.groups);
    }).then(function () {
        utils.importCircles(t, tableData.circles);
    }).then(function () {
        utils.importMessages(t, tableData.messages);
    }).then(function () {
        utils.importPosts(t, tableData.posts);
    }).then(function () {
        utils.importReposts(t, tableData.reposts);
    }).then(function () {
        utils.importSettings(t, tableData.settings);
    }).then(function () {
        //check if data which add to database is fail.

        if (t.flag === true) {
            t.rollback();
        }

    });
};

module.exports = {
    DataImporter: DataImporter,
    importData: function (data) {
        return new DataImporter().importData(data);
    }
};
