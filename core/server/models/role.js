// # Role Model

var icollegeShelf = require('./base'),
    _             = require('lodash'),
    errors        = require('../errors'),
    Promise       = require('bluebird'),

    Role,
    Roles;

Roles = icollegeShelf.schema('roles', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    permissible: function (roleModelOrId, action, context, loadedPermissions, hasUserPermission, hasAppPermission) {
        var self = this,
            checkAgainst = [],
            origArgs;

        // If we passed in an id instead of a model, get the model
        // then check the permissions
        if (_.isNumber(roleModelOrId) || _.isString(roleModelOrId)) {
            // Grab the original args without the first one
            origArgs = _.toArray(arguments).slice(1);
            // Get the actual post model
            return this.findOneAsync({id: roleModelOrId}).then(function (foundRoleModel) {
                // Build up the original args but substitute with actual model
                var newArgs = [foundRoleModel].concat(origArgs);

                return self.permissible.apply(self, newArgs);
            }, errors.logAndThrowError);
        }

        if (action === 'assign' && loadedPermissions.user) {
            if (_.any(loadedPermissions.user.roles, {name: 'SuperAdministrator'})) {
                checkAgainst = ['SuperAdministrator', 'Administrator', 'iColleger'];
            } else if (_.any(loadedPermissions.user.roles, {name: 'Administrator'})) {
                checkAgainst = ['Administrator', 'iColleger'];
            }

            // Role in the list of permissible roles
            hasUserPermission = roleModelOrId && _.contains(checkAgainst, roleModelOrId.get('name'));
        }

        if (hasUserPermission && hasAppPermission) {
            return Promise.resolve();
        }

        return Promise.reject();
    }

});

Role = icollegeShelf.model('Role', Roles);


module.exports = {
    Role: Role,
    Roles: Roles
};
