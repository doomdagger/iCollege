/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var _           = require('lodash'),
    promise     = require('bluebird'),
    node_uuid   = require('node-uuid'),
    User        = require('../../models/user').User,
    Role        = require('../../models/role').Role,
    Permission  = require('../../models/permission').Permission,

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
    var u = [],
        r = [],
        psa = [],
        pa = [],
        pi = [],
        ops = [];

    // we need super administrator's _id to ...
    // ... fill in created_by and updated_by for each object
    var sauid;
    var saStamp = function (obj) {
        obj.created_by = sauid;
        obj.updated_by = sauid;
        return obj;
    };

    // so we have to create super administrator at beginning ...
    _.forEach(fixtures.users, function (user) {
        u.push(new User(user));
    });
    // ... only then we can get the _id
    sauid = u[0]._id;
    _.forEach(u, function (user) {
        saStamp(user);
    });

    // get permissions ready...
    _.forEach(fixtures.permissions.SuperAdministrator, function (p) {
        psa.push(saStamp(new Permission(p)));
    });
    _.forEach(fixtures.permissions.Administrator, function (p) {
        pa.push(saStamp(new Permission(p)));
    });
    _.forEach(fixtures.permissions.iColleger, function (p) {
        pi.push(saStamp(new Permission(p)));
    });
    // ... and push them into roles:
    _.forEach(fixtures.roles, function (role) {
        r.push(saStamp(new Role(role)));
    });
    // SuperAdministrator ...
    _.forEach(psa, function (p) {
        r[0].permissions.push(p._id);
    });
    // ... Administrator ...
    _.forEach(pa, function (p) {
        r[1].permissions.push(p._id);
    });
    // ... and iColleger
    _.forEach(pi, function (p) {
        r[2].permissions.push(p._id);
    });

    // then roles are ready ...
    // ... and we can add them to users:
    // admin is a SuperAdministrator, Administrator and iColleger ...
    u[0].roles.push(r[0]._id);
    u[0].roles.push(r[1]._id);
    u[0].roles.push(r[2]._id);
    // ... admin2 is an Administrator and iColleger
    u[1].roles.push(r[1]._id);
    u[1].roles.push(r[2]._id);
    // ... and icolleger is an iColleger
    u[2].roles.push(r[2]._id);

    return psa.each(function (permission) {permission.saveAsync();}).then(function () {
        pa.each(function (permission) {permission.saveAsync();}).then(function () {
            pi.each(function (permission) {permission.saveAsync();}).then(function () {
                r.each(function (role) {role.saveAsync();}).then(function () {
                    u.each(function (user) {user.saveAsync();})
                });
            });
        });
    });
};

module.exports = {
    populateFixtures: populateFixtures
};
