var _ = require('lodash'),
    Models = require('../models'),
    errors = require('../errors'),
    when   = require('when'),
    Role   = Models.Role,
    User   = Models.User,
    App    = Models.App;

var effective = {
    user: function (id) {
        // find the user and project only permissions and roles fields
        return User.findOneAndPopulatePromised({_id: id}, 'permissions.permission_id', 'permissions roles')
            // inner callback for access to returned data
            .then(function (foundUser) {
                return Role.findAndPopulatePromised({_id: {$in: foundUser.roles}}, 'permissions.permission_id', 'permissions')
                    .then(function (foundRoles){

                        var seenPerms = {},
                            rolePerms = _.reduce(foundRoles, function (result, role) {
                                result.push(role.permissions);
                                return result;
                            }, []),
                            allPerms = [];

                        rolePerms.push(foundUser.permissions);

                        _.each(rolePerms, function (perm) {
                            var key = perm.permission_id.action_type + '-' + perm.permission_id.object_type + '-' + perm.permission_scope + '-' + perm.object_id;

                            // Only add perms once
                            if (seenPerms[key]) {
                                return;
                            }

                            // TODO: do not satisfy with the origin perm Object
                            allPerms.push(perm);
                            seenPerms[key] = true;
                        });

                        return allPerms;
                    });
            }).catch(errors.logAndThrowError);

    },

    app: function (id) {
        return App.findOneAndPopulatePromised({_id: id}, 'permissions.permission_id', 'permissions')
            .then(function (foundApp) {
                if (!foundApp) {
                    return [];
                }

                return foundApp.permissions;
            }).catch(errors.logAndThrowError);
    }
};

module.exports = effective;