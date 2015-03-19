// # Role Model

var icollegeShelf = require('./base'),
    Role,
    Roles;

Roles = icollegeShelf.schema('roles', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    /**
     * Returns an array of keys permitted in a method's `options` hash, depending on the current method.
     * @param {String} methodName The name of the method to check valid options for.
     * @return {Array} Keys allowed in the `options` hash of the model's method.
     */
    permittedOptions: function (methodName) {
        var options = icollegeShelf.Model.permittedOptions(),

        // whitelists for the `options` hash argument on methods, by method name.
        // these are the only options that can be passed to Bookshelf / Knex.
            validOptions = {
                findOne: ['withRelated']
            };

        if (validOptions[methodName]) {
            options = options.concat(validOptions[methodName]);
        }

        return options;
    },

    permissible: function (roleModelOrId, action, context, loadedPermissions, hasUserPermission, hasAppPermission) {

        return Promise.resolve();
    }

});

Role = icollegeShelf.model('Role', Roles);


module.exports = {
    Role: Role,
    Roles: Roles
};
