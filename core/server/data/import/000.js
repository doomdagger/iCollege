/**
 * Importer 000
 * Created by Li He on 2014/7/25.
 * Updated by (Lu Wanbo) on 2014/7/30.
 */

var when         = require('when'),
    _            = require('lodash'),
    User         = require('../../models/user').User,
    App          = require('../../models/app').App,
    Notification = require('../../models/notification').Notification,
    Role         = require('../../models/role').Role,
    Permission   = require('../../models/permission').Permission,
    Group        = require('../../models/group').Group,
    Circle       = require('../../models/circle').Circle,
    Message      = require('../../models/message').Message,
    Post         = require('../../models/post').Post,
    Repost       = require('../../models/repost').Repost,
    Setting      = require('../../models/settings').Setting,
    utils        = require('../utils'),
    mongoose = require('mongoose'),
    Importer000;


Importer000 = function () {
    _.bindAll(this, 'basicImport');

    this.version = '000';

    this.importFrom = {
        '000': this.basicImport
    }

};

Importer000.prototype.canImport = function (data) {
    data = data.db[0];
    if (data.meta && data.meta.version && this.importFrom[data.meta.version]) {
        return when.resolve(this.importFrom[data.meta.version]);
    }

    return when.reject("Unsupported version of data: " + data.meta.version);
};

Importer000.prototype.importData = function (data) {
    return this.canImport(data)
        .then(function (importerFunc) {
            return importerFunc(data);
        }, function (reason) {
            return when.reject(reason);
        });
};

function stripProperties(properties, data) {
    data = _.clone(data, true);
    _.each(data, function (obj) {
        _.each(properties, function (property) {
            delete obj[property];
        });
    });
    return data;
}

function importUsers(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(user) {
        optPromise.push(new User(user).savePromised());
//        new User(user).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if(err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importApps(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(app) {
        optPromise.push(new App(app).savePromised);
//        new App(app).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importNotifications(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(notification) {
        optPromise.push(new Notification(notification).savePromised);
//        new Notification(notification).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if(err) {
//                optPromise.push(defered.reject(err));
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importRoles(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(role) {
        optPromise.push(new Role(role).savePromised());
//        var defered = when.defer();
//        new Role(role).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importPermissions(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(permission) {
        optPromise.push(new Permission(permission).savePromised());
//        var defered = when.defer();
//        new Permission(permission).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importGroups(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(group) {
        optPromise.push(new Group(group).savePromised());
//        var defered = when.defer();
//        new Group(group).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importCircles(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(circle) {
        optPromise.push(new Circle(circle).savePromised());
//        var defered = when.defer();
//        new Circle(circle).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importMessages(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(message) {
        optPromise.push(new Post(post).savePromised());
//        var defered = when.defer();
//        new Message(message).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importPosts(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(post) {
        optPromise.push(new Post(post).savePromised());
//        var defered = when.defer();
//        new Post(post).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importReposts(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(repost) {
        optPromise.push(new Repost(repost).savePromised());
//        var defered = when.defer();
//        new Repost(repost).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//            optPromise.push(defered.promise);
//        });
    });
    return optPromise;
}

function importSettings(optPromise, jsonData, strip) {
    if(strip) {
        jsonData = stripProperties(strip, jsonData);
    }

    _.each(jsonData, function(setting) {
        optPromise.push(new Setting(setting).savePromised());
//        var defered = when.defer();
//        new Setting(setting).save(function (err, product, numberAffected) {
//            defered = when.defer();
//            if (err) {
//                optPromise.push(defered.reject(err));
//                return;
//            }
//            defered.resolve(numberAffected);
//        });
//        optPromise.push(defered.promise);
    });
    return optPromise;
}

Importer000.prototype.basicImport = function (data) {
    dbData = data.db[0].data;
    var optPromise = [];

    //pre-processing here

    //import things:
    if(dbData.users[1] && dbData.users[1].length) {
        importUsers(optPromise, dbData.users[1]);
    }
    if(dbData.apps[1] && dbData.apps[1].length) {
        importApps(optPromise, dbData.apps[1]);
    }
    if(dbData.notifications[1] && dbData.notifications[1].length) {
        importNotifications(optPromise, dbData.notifications[1]);
    }
    if(dbData.roles[1] && dbData.roles[1].length) {
        importRoles(optPromise, dbData.roles[1]);
    }
    if(dbData.permissions[1] && dbData.permissions[1].length) {
        importPermissions(optPromise, dbData.permissions[1]);
    }
    if(dbData.groups[1] && dbData.groups[1].length) {
        importGroups(optPromise, dbData.groups[1]);
    }
    if(dbData.circles[1] && dbData.circles[1].length) {
        importCircles(optPromise, dbData.circles[1]);
    }
    if(dbData.messages[1] && dbData.messages[1].length) {
        importMessages(optPromise, dbData.messages[1]);
    }
    if(dbData.posts[1] && dbData.posts[1].length) {
        importPosts(optPromise, dbData.posts[1]);
    }
    if(dbData.reposts[1] && dbData.reposts[1].length) {
        importReposts(optPromise, dbData.reposts[1]);
    }
    if(dbData.settings[1] && dbData.settings[1].length) {
        importSettings(optPromise, dbData.settings[1]);
    }

    var defered = when.defer();
    var count = 0;
    _.each(optPromise, function (promise) {
        var result = promise.inspect();
        if(result === 'rejected') {
            defered.reject(result.reason);
            return;
        }
        count += result.value;
    });
    defered.resolve(count);
    return defered;
};

module.exports = {
    Importer000: Importer000,
    importData: function (data) {
        return utils.safeDropCollections().then(function () {
            return new Importer000().importData(data);
        });
    }
};

