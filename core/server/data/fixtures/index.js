/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var _           = require('lodash'),
    Promise     = require('bluebird'),
    mongoose    = require('mongoose'),
    node_uuid        = require('node-uuid'),

    Models      = require('../../models'),

    sequence    = require('../../utils/sequence'),

    populateFixtures;

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
var fixtures = require('./fixtures.json');

populateFixtures = function () {
    var User      = Models.User,
        Role       = Models.Role,
        Permission = Models.Permission;

    var ops = [];

    // Super Administrator's _id is fixed to ffffffffffffffffffffffff
    var sauid = mongoose.Types.ObjectId('ffffffffffffffffffffffff');
    var saStamp = function (obj) {
        obj.created_by = sauid;
        obj.updated_by = sauid;
        return obj;
    };

    return Promise.try(function () {
        var roleNames = _.keys(fixtures.permissions);
        ops.permissions = [];
        _.forEach(roleNames, function (roleName) {
            _.forEach(fixtures.permissions[roleName], function (permission) {
                if (!_.isObject(permission.uuid)) {
                    permission.uuid = node_uuid.v4();
                }
                ops.permissions[roleName] = [];
                ops.permissions[roleName].push(saStamp(new Permission(permission).saveAsync()));
            });
        });
    }).then(function () {
        var opsRoleNames = _.keys(ops.permissions);
        ops.roles = [];
        _.forEach(opsRoleNames, function (roleName) {
            return sequence(ops.permissions[roleName]).then(function (arrays) {
                _.map(fixtures.roles, function (r) {
                    if (!_.isObject(r.uuid)) {
                        r.uuid = node_uuid.v4();
                    }
                    if (roleName === r.name) {
                        var role = saStamp(new Role(r));
                        _.forEach(arrays, function(permission) {
                            role.permissions.push(permission._id);
                        });
                        ops.roles.push(role.saveAsync());
                    }
                });
            });
        });
    }).then(function () {
        return sequence(ops.roles).then(function (array) {
            var users = [];
            ops.users = [];
            _.forEach(fixtures.users, function (user) {
                if (! _.isObject(user.uuid)) {
                    user.uuid = node_uuid.v4();
                    users.push(saStamp(new User(user)));
                }
            });
            users[0]._id = sauid;
            _.forEach(array, function (role) {
                _.forEach(users, function (user) {
                    if (role.name === 'SuperAdministrator') {
                        if (user.name === 'admin') {
                            user.roles.push(role._id);
                        }
                    }
                    if (role.name === 'Administrator') {
                        if (user.name !== 'iColleger') {
                            user.roles.push(role._id);
                        }
                    }
                    if (role.name === 'iColleger') {
                        user.roles.push(role._id);
                    }
                    ops.users.push(user.saveAsync());
                });
            });
            // other fixtures saves here after users are saved
        })
    }).then(function () {
        return sequence(ops.users)
    });
};

module.exports = {
    populateFixtures: populateFixtures
};
