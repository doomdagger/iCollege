/**
 * Import Module for iCollege
 * According to the given version of database, we will
 * select appropriate version of importer for our data
 * population.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16
 */


//var when = require('when');
//
//module.exports = function (version, data) {
//    var importer;
//
//    try {
//        importer = require('./' + version);
//    } catch (ignore) {
//        // Zero effs given
//    }
//
//    if (!importer) {
//        return when.reject("No importer found");
//    }
//
//    return importer.importData(data);
//};

var Promise     = require('bluebird'),
    _           = require('lodash'),
    models      = require('../../models'),
    errors      = require('../../errors'),
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
    //globalUtils = require('../../utils'),

    internal    = {context: {internal: true}},
    utils,
    areEmpty,
    updatedSettingKeys,
    stripProperties;

updatedSettingKeys = {
    activePlugins: 'activeApps',
    installedPlugins: 'installedApps'
};

areEmpty = function (object) {
    var fields = _.toArray(arguments).slice(1),
        areEmpty = _.all(fields, function (field) {
            return _.isEmpty(object[field]);
        });

    return areEmpty;
};

stripProperties = function stripProperties(properties, data) {
    data = _.clone(data, true);
    _.each(data, function (obj) {
        _.each(properties, function (property) {
            delete obj[property];
        });
    });
    return data;
};

utils = {

    importUsers : function importUsers(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (user) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new User(user).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("users", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                        return Promise.reject(error);
                    }));
        });
        return transaction;
    },

    importApps : function importApps(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (app) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new App(app).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("apps", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importNotifications : function importNotifications(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (notification) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Notification(notification).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("notifications", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importRoles : function importRoles(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (role) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Role(role).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("roles", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importPermissions : function importPermissions(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (permission) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Permission(permission).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("permissions", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importGroups : function importGroups(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (group) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Group(group).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("groups", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importCircles : function importCircles(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (circle) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Circle(circle).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("circles", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importMessages : function importMessages(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (message) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Message(message).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("messages", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importPosts : function importPosts(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (post) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Post(post).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("posts", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importReposts : function importReposts(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (repost) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Repost(repost).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("reposts", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    },

    importSettings : function importSettings(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (setting) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            transaction.ops.push(new Setting(setting).saveAsync()
                .then(function (savedPerson) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("settings", [{_id : savedPerson._id}]);
                })
                .catch(function (error) {
                    return Promise.reject(error);
                }));
        });
        return transaction;
    }
};

module.exports = utils;
