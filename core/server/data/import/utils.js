/**
 * Import Module for iCollege
 * According to the given version of database, we will
 * select appropriate version of importer for our data
 * population.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16
 */

var Promise     = require('bluebird'),
    _           = require('lodash'),
    models       = require('../../models'),
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

            transaction.ops.push(models.User.forge(user, internal).saveAsync()
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

            transaction.ops.push(models.App.forge(app, internal).saveAsync()
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

            transaction.ops.push(models.Notification.forge(notification, internal).saveAsync()
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

            transaction.ops.push(models.Role.forge(role, internal).saveAsync()
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

            transaction.ops.push(models.Permission.forge(permission, internal).saveAsync()
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

            transaction.ops.push(models.Group.forge(group, internal).saveAsync()
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

            transaction.ops.push(models.Circle.forge(circle, internal).saveAsync()
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

            transaction.ops.push(models.Message.forge(message, internal).saveAsync()
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

            transaction.ops.push(models.Post.forge(post, internal).saveAsync()
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

            transaction.ops.push(models.Repost.forge(repost, internal).saveAsync()
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

            transaction.ops.push(models.Settings.forge(setting, internal).saveAsync()
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
