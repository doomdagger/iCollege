/**
 * data import
 * Created by Li He on 2014/7/25.
 * Updated by (Lu Wanbo) on 2014/7/30.
 * Updated by Xie Wei on 2015/2/20.
 */

//Importer000 = function () {
//    _.bindAll(this, 'basicImport');
//
//    this.version = '000';
//
//    this.importFrom = {
//        '000': this.basicImport
//    };
//
//};
//
//Importer000.prototype.canImport = function (data) {
//    data = data.db[0];
//    if (data.meta && data.meta.version && this.importFrom[data.meta.version]) {
//        return Promise.resolve(this.importFrom[data.meta.version]);
//    }
//
//    return Promise.reject("Unsupported version of data: " + data.meta.version);
//};
//
//Importer000.prototype.importData = function (data) {
//    return this.canImport(data)
//        .then(function (importerFunc) {
//            return importerFunc(data);
//        }, function (reason) {
//            return Promise.reject(reason);
//        });
//};
//
//function stripProperties(properties, data) {
//    data = _.clone(data, true);
//    _.each(data, function (obj) {
//        _.each(properties, function (property) {
//            delete obj[property];
//        });
//    });
//    return data;
//}
//
//
//Importer000.prototype.basicImport = function (data) {
//    var dbData = data.db[0].data,
//        optPromise = [],
//        deferred = Promise.defer(),
//        count = 0;
//
//    //pre-processing here
//
//    //import things:
//    if (dbData.users[1] && dbData.users[1].length) {
//        importUsers(optPromise, dbData.users[1]);
//    }
//    if (dbData.apps[1] && dbData.apps[1].length) {
//        importApps(optPromise, dbData.apps[1]);
//    }
//    if (dbData.notifications[1] && dbData.notifications[1].length) {
//        importNotifications(optPromise, dbData.notifications[1]);
//    }
//    if (dbData.roles[1] && dbData.roles[1].length) {
//        importRoles(optPromise, dbData.roles[1]);
//    }
//    if (dbData.permissions[1] && dbData.permissions[1].length) {
//        importPermissions(optPromise, dbData.permissions[1]);
//    }
//    if (dbData.groups[1] && dbData.groups[1].length) {
//        importGroups(optPromise, dbData.groups[1]);
//    }
//    if (dbData.circles[1] && dbData.circles[1].length) {
//        importCircles(optPromise, dbData.circles[1]);
//    }
//    if (dbData.messages[1] && dbData.messages[1].length) {
//        importMessages(optPromise, dbData.messages[1]);
//    }
//    if (dbData.posts[1] && dbData.posts[1].length) {
//        importPosts(optPromise, dbData.posts[1]);
//    }
//    if (dbData.reposts[1] && dbData.reposts[1].length) {
//        importReposts(optPromise, dbData.reposts[1]);
//    }
//    if (dbData.settings[1] && dbData.settings[1].length) {
//        importSettings(optPromise, dbData.settings[1]);
//    }
//
//
//    _.each(optPromise, function (promise) {
//        var result = promise.inspect();
//        if (result === 'rejected') {
//            deferred.reject(result.reason);
//            return;
//        }
//        count += result.value;
//    });
//    deferred.resolve(count);
//    return deferred.promise;
//};
//
//module.exports = {
//    Importer000: Importer000,
//    importData: function (data) {
//        utils.safeDropCollections();
//        setTimeout(function () {}, 1000000);
//        return new Importer000.importData(data);
//        return utils.safeDropCollections().then(function () {
//            return new Importer000().importData(data);
//        });
//    }
//};

var Promise = require('bluebird'),
    _       = require('lodash'),
    utils   = require('./utils'),
    Transaction = require('../utils/transaction'),

    DataImporter;

DataImporter = function () {};

DataImporter.prototype.importData = function (data) {
    return this.doImport(data);
};

DataImporter.prototype.doImport = function (data) {
    var tableData = data.data,
        errors = [],
        t = new Transaction();

    return Promise.settle(function () {
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
        t.ops.forEach(function (p) {
            if (p.isRejected()) {
                errors = errors.concat(p.reason());
            }
        });

        if (errors.length !== 0) {
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
