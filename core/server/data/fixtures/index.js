/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var _           = require('lodash'),
    Promise     = require('bluebird'),
    errors      = require('../../errors'),
    config      = require('../../config'),

    models      = require('../../models'),
    sequence    = require('../../utils/sequence'),
    fixtures    = require('./fixtures.json'),
    internal    = {context: {internal: true}},

    // private
    logInfo,
    addAllPermissions,
    addAllRoles,
    addAllRolesPermissions,
    addRolesPermissionsForRole,
    addAllUsers,

    populate;

// before handle, populate demo user or posts or message data
// into database.
// ### How to do this:
// 1. populate permissions
// 2. populate roles
// 3. update roles by binding to some permissions
// 4. populate users
// 5. update users by binding to some roles

// Common: add all create_by and update_by fields for all documents
// Attention: Super Administrator's uuid is special, because we need to know it beforehand
// in order to fetch it by hard-coded codes.
//noinspection JSUnresolvedFunction

logInfo = function logInfo(message) {
    errors.logInfo('Migrations', message);
};


addAllPermissions = function (options) {
    var ops = [];
    _.each(fixtures.permissions, function (permissions, objectType) {
        _.each(permissions, function (permission) {
            ops.push(function () {
                permission.object_type = objectType;
                return models.Permission.forge(permission).__save(options);
            });
        });
    });

    return sequence(ops);
};

addAllRoles = function (options) {
    var ops = [];
    _.each(fixtures.roles, function (role) {
        ops.push(function () {
            return models.Role.forge(role).__save(options);
        });
    });

    return sequence(ops);
};

addRolesPermissionsForRole = function (roleName, options) {
    var fixturesForRole = fixtures.permissions_roles[roleName];

    return models.Role.findOne({name: roleName}).then(function (role) {
        return models.Permission.findAll().then(function (permissions) {
            if (_.isObject(fixturesForRole)) {
                _.each(permissions, function (permission) {
                    var objectPermissions = fixturesForRole[permission.object_type];
                    if (objectPermissions === 'all') {
                        role.permissions.push(permission.id);
                    } else if (_.isArray(objectPermissions) && _.contains(objectPermissions, permission.action_type)) {
                        role.permissions.push(permission.id);
                    }
                });
            }
            return role.__save(options);
        });
    });
};

addAllRolesPermissions = function (options) {
    var roleNames = _.keys(fixtures.permissions_roles),
        ops = [];

    _.each(roleNames, function (roleName) {
        ops.push(addRolesPermissionsForRole(roleName, options));
    });

    return Promise.all(ops);
};

addAllUsers = function (options) {
    var ops = [];
    _.each(fixtures.users, function (user) {
        ops.push(function () {
            if (user.name === "admin") {
                user._id = config.adminId;
            }
            return models.User.forge(user).__save(options);
        });
    });

    return sequence(ops);
};

// ## Populate
populate = function () {
    var options = internal;

    logInfo('Populating permissions');
    // ### Ensure all permissions are added
    return addAllPermissions(options).then(function () {
        // ### Ensure all roles are added
        return addAllRoles(options);
    }).then(function () {
        // ### Ensure all roles_permissions are added
        return addAllRolesPermissions(options);
    }).then(function () {
        // ### Ensure all roles_permissions are added
        return addAllUsers(options);
    });
};



module.exports = {
    populateFixtures: populate
};
