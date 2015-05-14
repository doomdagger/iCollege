/**
 * Import Module for iCollege
 * According to the given version of database, we will
 * select appropriate version of importer for our data
 * population.
 * Created by Li He on 2014/7/25.
 * Edited by Xie Wei on 2015/2/16
 */

var
    //Promise     = require('bluebird'),
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

           models.User.forge(user, internal).__save()
               .then(function (savedUser) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("users", {_id : savedUser._id});
                })
                .catch(function () {
                    transaction.flag = true;
               });
        });
        
    },

    importApps : function importApps(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (app) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.App.forge(app, internal).__save()
                .then(function (savedApp) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("apps", {_id : savedApp._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importNotifications : function importNotifications(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (notification) {
            // add pass-through  handling so that bluebird doesn't think we've dropped it

            models.Notification.forge(notification, internal).__save()
                .then(function (savedNotification) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("notifications", {_id : savedNotification._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importRoles : function importRoles(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (role) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Role.forge(role, internal).__save()
                .then(function (savedRole) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("roles", {_id : savedRole._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importPermissions : function importPermissions(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (permission) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Permission.forge(permission, internal).__save()
                .then(function (savedPermission) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("permissions", {_id : savedPermission._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importGroups : function importGroups(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (group) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Group.forge(group, internal).__save()
                .then(function (savedGroup) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("groups", {_id : savedGroup._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importCircles : function importCircles(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (circle) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Circle.forge(circle, internal).__save()
                .then(function (savedCircle) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("circles", {_id : savedCircle._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importMessages : function importMessages(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (message) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Message.forge(message, internal).__save()
                .then(function (savedMessage) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("messages", {_id : savedMessage._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importPosts : function importPosts(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (post) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Post.forge(post, internal).__save()
                .then(function (savedPost) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("posts", {_id : savedPost._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importReposts : function importReposts(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (repost) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Repost.forge(repost, internal).__save()
                .then(function (savedRepost) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("reposts", {_id : savedRepost._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    },

    importSettings : function importSettings(transaction, jsonData, strip) {
        if (strip) {
            jsonData = stripProperties(strip, jsonData);
        }
        _.each(jsonData, function (setting) {
            // add pass-through error handling so that bluebird doesn't think we've dropped it

            models.Settings.forge(setting, internal).__save()
                .then(function (savedSetting) {
                    //if the save function is success,we should save the _id member into transaction
                    transaction.backup("settings", {_id : savedSetting._id});
                })
                .catch(function () {
                    transaction.flag = true;
                });
        });
        
    }
};

module.exports = utils;
