/**
 * data import
 * Created by Li He on 2014/7/25.
 * Updated by (Lu Wanbo) on 2014/7/30.
 * Updated by Xie Wei on 2015/2/20.
 */


var Promise         = require('bluebird'),
    utils   = require('./utils'),
    models       = require('../../models'),
    Transaction = require('../utils/transaction'),

    DataImporter;

DataImporter = function () {};

DataImporter.prototype.importData = function (data) {
    return this.doImport(data);
};

DataImporter.prototype.doImport = function (data) {
    var tableData = data.data,
        t = new Transaction();

    return utils.importData(models.User, "users", t, tableData.users).then(function () {
        return  utils.importData(models.App, "apps", t, tableData.apps);
    }).then(function () {
        return utils.importData(models.Notification, "notifications", t, tableData.notifications);
    }).then(function () {
        return utils.importData(models.Role, "roles", t, tableData.roles);
    }).then(function () {
        return utils.importData(models.Permission, "permissions", t, tableData.permissions);
    }).then(function () {
        return utils.importData(models.Group, "groups", t, tableData.groups);
    }).then(function () {
        return utils.importData(models.Circle, "circles", t, tableData.circles);
    }).then(function () {
        return utils.importData(models.Message, "messages", t, tableData.messages);
    }).then(function () {
        return utils.importData(models.Post, "posts", t, tableData.posts);
    }).then(function () {
        return utils.importData(models.Repost, "reposts", t, tableData.reposts);
    }).then(function () {
        return utils.importData(models.Settings, "settings", t, tableData.settings);
    }).then(function () {
        //check if data which add to database is fail.
        if (t.flag === true) {
            return t.rollback();
        }
    }).catch(function (err) {
        return Promise.resolve(err);
    });
};

module.exports = {
    DataImporter: DataImporter,
    importData: function (data) {
        return new DataImporter().importData(data);
    }
};
