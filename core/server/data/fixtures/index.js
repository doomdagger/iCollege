/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var _           = require('lodash'),
    Promise     = require('bluebird'),

    Models      = require('../../models'),

    errors      = require('../../errors'),
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

    var gatherResults = function (array) {
        _.forEach(array, function (promise) {
            ops.push(promise);
        });
    };
    // so we have to create super administrator at beginning ...
    _.forEach(fixtures.users, function (user) {
        u.push(new User(user));
    });
    u[0].saveAsync().then(function () {
        sauid = u[0]._id;
    });
    // ... only then we can get the _id
    _.forEach(u, function (user) {
        saStamp(user);
    });

    // get roles ready
    _.forEach(fixtures.roles, function (role) {
        r.push(saStamp(new Role(role)));
    });
    // then get permissions ready , save them into db and push them into roles ...
    // ... SuperAdministrator ...
    _.forEach(fixtures.permissions.SuperAdministrator, function (p) {
        psa.push(saStamp(new Permission(p)).save());
    });
    gatherResults(sequence(psa).then(function (array) {
        _.forEach(array, function (permission) {
            r[0].permissions.push(permission._id);
        });
    }));
    // ... Administrator ...
    _.forEach(fixtures.permissions.Administrator, function (p) {
        pa.push(saStamp(new Permission(p)).save());
    });
    gatherResults(sequence(pa).then(function (array) {
        _.forEach(array, function (permission) {
            r[1].permissions.push(permission._id);
        });
    }));
    // ... and iColleger
    _.forEach(fixtures.permissions.iColleger, function (p) {
        pi.push(saStamp(new Permission(p)).save());
    });
    gatherResults(sequence(pi).then(function (array) {
        _.forEach(array, function (permission) {
            r[2].permissions.push(permission._id);
        });
    }));
    // then save roles into db ...
    gatherResults(sequence([].push(r[0].save(), r[1].save(), r[2].save())).then(function (array) {
        u[0].roles.push(array[0]._id, array[1]._id, array[2]._id);
        u[1].roles.push(array[1]._id, array[2]._id);
        u[2].roles.push(array[2]._id);
    }));
    // finally save users into db ...
    gatherResults(sequence([].push(u[0].save(), u[1].save(), u[2].save())));

    return Promise.all(ops).catch(function (err) {
        errors.logError(err);
    });
};

module.exports = {
    populateFixtures: populateFixtures
};
