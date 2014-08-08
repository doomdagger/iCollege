var _ = require('lodash'),
    Models = require('../models'),
    errors = require('../errors'),
    Role   = Models.Role,
    User   = Models.User,
    App    = Models.App;

var effective = {
    user: function (id) {
        // find the user and project only permissions and roles fields
        return User.findOneAndPopulatePromised({_id: id}, {
            path: 'permissions.permission_id',
            select: 'name object_type action_type'
        }, 'permissions roles')
            // inner callback for access to returned data
            .then(function (foundUser) {
                return Role.findAndPopulatePromised({_id: {$in: foundUser.roles}}, {
                    path: 'permissions.permission_id',
                    select: 'name object_type action_type'
                }, 'permissions')
                    .then(function (foundRoles) {

                        var seenPerms = {},
                            rolePerms = _.map(foundRoles, function (role) {
                                return role.permissions;
                            }),
                            allPerms = [];

                        rolePerms.push(foundUser.permissions);

                        _.each(rolePerms, function (rolePermGroup) {
                            _.each(rolePermGroup, function (perm) {
                                var key = perm.permission_id.action_type + '-' + perm.permission_id.object_type + '-' + perm.permission_scope + '-' + perm.object_fields + '-' + perm.object_values,
                                    newPerm = {};

                                // Only add perms once
                                if (seenPerms[key]) {
                                    return;
                                }

                                _.each(Object.keys(perm), function (key) {
                                    if (key === "permission_id") {
                                        _.assign(newPerm, perm[key]);
                                    } else {
                                        newPerm[key] = perm[key];
                                    }
                                });

                                allPerms.push(newPerm);
                                seenPerms[key] = true;
                            });
                        });

                        return allPerms;
                    });
            }).catch(errors.logAndThrowError);

    },

    app: function (id) {
        return App.findOneAndPopulatePromised({_id: id}, 'permissions.permission_id', 'permissions')
            .then(function (foundApp) {
                var allPerms = [];

                if (!foundApp) {
                    return [];
                }

                _.each(foundApp.permissions, function (perm) {
                    var newPerm = {};

                    _.each(Object.keys(perm), function (key) {
                        if (key === "permission_id") {
                            _.assign(newPerm, perm[key]);
                        } else {
                            newPerm[key] = perm[key];
                        }
                    });

                    allPerms.push(newPerm);
                });

                return allPerms;
            }).catch(errors.logAndThrowError);
    }
};

module.exports = effective;