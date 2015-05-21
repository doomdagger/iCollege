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
    addAllClients,
    createSuperAdministrator,
    createAdministrator,
    createIColloger,

    // public
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


addAllPermissions = function () {
    var ops = [];
    _.each(fixtures.permissions, function (permissions, objectType) {
        _.each(permissions, function (permission) {
            ops.push(function () {
                permission.object_type = objectType;
                return models.Permission.add(permission, internal);
            });
        });
    });

    return sequence(ops);
};

addAllRoles = function () {
    var ops = [];
    _.each(fixtures.roles, function (role) {
        ops.push(function () {
            return models.Role.add(role, internal);
        });
    });

    return sequence(ops);
};

addRolesPermissionsForRole = function (roleName) {
    var fixturesForRole = fixtures.permissions_roles[roleName];

    return models.Role.findSingle({name: roleName}).then(function (role) {
        return models.Permission.findAll().then(function (permissions) {
            if (_.isObject(fixturesForRole)) {
                _.each(permissions, function (permission) {
                    var objectPermissions = fixturesForRole[permission.object_type];
                    if (objectPermissions === 'all') {
                        role.permissions.push(permission._id);
                    } else if (_.isArray(objectPermissions) && _.contains(objectPermissions, permission.action_type)) {
                        role.permissions.push(permission._id);
                    }
                });
            }
            return role.__save(internal);
        });
    });
};

addAllRolesPermissions = function () {
    var roleNames = _.keys(fixtures.permissions_roles),
        ops = [];

    _.each(roleNames, function (roleName) {
        ops.push(addRolesPermissionsForRole(roleName, internal));
    });

    return Promise.all(ops);
};

createSuperAdministrator = function () {
    var user = fixtures.users[0];

    return models.Role.findSingle({name: 'SuperAdministrator'}).then(function (ownerRole) {
        user.roles = [ownerRole._id];
        user._id = config.adminId;

        logInfo('Creating SuperAdministrator');
        return models.User.add(user, internal);
    });
};

createAdministrator = function () {
    var user = fixtures.users[1];

    return models.Role.findSingle({name: 'Administrator'}).then(function (adminRole) {
        user.roles = [adminRole._id];

        logInfo('Creating Administrator');
        return models.User.add(user, internal);
    });
};

createIColloger = function () {
    var user = fixtures.users[2];

    return models.Role.findSingle({name: 'iColleger'}).then(function (userRole) {
        user.roles = [userRole._id];

        logInfo('Creating iColleger');
        return models.User.add(user, internal);
    });
};

addAllUsers = function () {
    var ops = [];

    ops.push(createSuperAdministrator());
    ops.push(createAdministrator());
    ops.push(createIColloger());

    return Promise.all(ops);
};

addAllClients = function () {
    var ops = [];

    _.each(fixtures.clients, function (client) {
        ops.push(models.Client.add(client, internal));
    });

    return Promise.all(ops);
};

// ## Populate
populate = function () {
    logInfo('Populating permissions');
    // ### Ensure all permissions are added
    return addAllPermissions().then(function () {
        // ### Ensure all roles are added
        return addAllRoles();
    }).then(function () {
        // ### Ensure all roles_permissions are added
        return addAllRolesPermissions();
    }).then(function () {
        // ### Ensure all user and clients are added
        return Promise.all([addAllUsers(), addAllClients()]);
    });
};



module.exports = {
    populateFixtures: populate
};
