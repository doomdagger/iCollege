var _ = require('lodash'),
    Models = require('../models'),
    errors = require('../errors'),
    effective;

effective = {
    user: function (id) {
        var seenPerms = {},
            allPerms = [],
            rolePerms,
            user;

        return Models.User.findOne({_id: id}, 'permissions roles').populate('permissions').execAsync()
            .then(function (foundUser) {
                user = foundUser.jsonify();

                return Models.Role.find({_id: {$in: foundUser.roles}}).populate("permissions").execAsync();
            }).then(function (roles) {

                rolePerms = _.map(roles, function (role) {
                    return role.permissions;
                });
                rolePerms.push(user.permissions);

                _.each(rolePerms, function (rolePermGroup) {
                    _.each(rolePermGroup, function (perm) {
                        var key = perm.get('action_type') + '-' + perm.get('object_type') + '-' + perm.get('object_id');

                        // Only add perms once
                        if (seenPerms[key]) {
                            return;
                        }

                        allPerms.push(perm);
                        seenPerms[key] = true;
                    });
                });

                return {permissions: allPerms, roles: roles};
            }).catch(errors.logAndThrowError);
    },

    app: function (appName) {
        return Models.App.findOne({name: appName}).populate('permissions').execAsync()
            .then(function (foundApp) {
                if (!foundApp) {
                    return [];
                }

                return {permissions: foundApp.permissions};
            }, errors.logAndThrowError);
    }
};

module.exports = effective;
