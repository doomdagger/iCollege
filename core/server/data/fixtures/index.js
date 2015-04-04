/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var sequence    = require('when/sequence'),
    _           = require('lodash'),
    when        = require('when'),
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
var fixtures = require("./fixtures.json");

//populateFixtures = function () {
//    var ops = [],
//
//        u = [],
//        p = [],
//        r = [],
//
//        sa_id,
//
//        sa_id_adder = function (object) {
//            object.created_by = sa_id;
//            object.updated_by = sa_id;
//        };
//
//    //users
//    u.push(new User(fixtures.users[0]));
//    sa_id = u[0]._id;
//
//    sa_id_adder(u[0]);
//
//    u.push(new User(fixtures.users[1]));
//    sa_id_adder(u[1]);
//
//    u.push(new User(fixtures.users[2]));
//    sa_id_adder(u[2]);
//
//    //permissions
//    _.each(fixtures.permissions, function (per) {
//        var permission = new Permission(per);
//        sa_id_adder(permission);
//        p.push(permission);
//    });
//
//    function permissionAdder(permission, scope, fields, values) {
//        return {
//            permission_id: permission._id,
//            permission_scope: scope,
//            object_fields: fields,
//            object_values: values
//        };
//    }
//    function superadminPermissionAdder(object) {
//        object.permissions.push(permissionAdder(p[43], 'all'));
//        object.permissions.push(permissionAdder(p[44], 'all'));
//        object.permissions.push(permissionAdder(p[45], 'all'));
//    }
//    function adminPermissionAdder(object) {
//        object.permissions.push(permissionAdder(p[0], 'all'));
//        object.permissions.push(permissionAdder(p[7], 'all'));
//        object.permissions.push(permissionAdder(p[15], 'all'));
//        object.permissions.push(permissionAdder(p[17], 'all'));
//        object.permissions.push(permissionAdder(p[18], 'all'));
//        object.permissions.push(permissionAdder(p[21], 'all'));
//        object.permissions.push(permissionAdder(p[23], 'all'));
//        object.permissions.push(permissionAdder(p[24], 'all'));
//        object.permissions.push(permissionAdder(p[25], 'all'));
//        object.permissions.push(permissionAdder(p[26], 'all'));
//        object.permissions.push(permissionAdder(p[27], 'all'));
//        object.permissions.push(permissionAdder(p[28], 'all'));
//        object.permissions.push(permissionAdder(p[29], 'all'));
//        object.permissions.push(permissionAdder(p[32], 'all'));
//        object.permissions.push(permissionAdder(p[35], 'all'));
//    }
//    function userPermissionAdder(object) {
//        object.permissions.push(permissionAdder(p[1], 'all'));
//        object.permissions.push(permissionAdder(p[2], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[3], 'all'));
//        object.permissions.push(permissionAdder(p[4], 'all'));
//        object.permissions.push(permissionAdder(p[5], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[6], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[8], 'all'));
//        object.permissions.push(permissionAdder(p[9], 'all'));
//        object.permissions.push(permissionAdder(p[10], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[11], 'all'));
//        object.permissions.push(permissionAdder(p[12], 'all'));
//        object.permissions.push(permissionAdder(p[13], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[14], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[16], 'me', ['_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[19], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[20], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[22], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[30], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[31], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[33], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[34], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[36], 'me'));
//        object.permissions.push(permissionAdder(p[37], 'me'));
//        object.permissions.push(permissionAdder(p[38], 'me'));
//        object.permissions.push(permissionAdder(p[39], 'me'));
//        object.permissions.push(permissionAdder(p[40], 'me'));
//        object.permissions.push(permissionAdder(p[41], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[42], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[46], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[47], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[48], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[49], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[50], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[51], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[52], 'me', ['user_id'], ['$_id']));
//        object.permissions.push(permissionAdder(p[53], 'me', ['user_id'], ['$_id']));
//    }
//    //super administrator role
//    r.push(new Role(fixtures.roles[0]));
//    sa_id_adder(r[0]);
//    superadminPermissionAdder(r[0]);
//
//    //administrator role
//    r.push(new Role(fixtures.roles[1]));
//    sa_id_adder(r[1]);
//    adminPermissionAdder(r[1]);
//
//    //icolleger role
//    //all-scoped and me-scoped permissions only
//    r.push(new Role(fixtures.roles[2]));
//    sa_id_adder(r[2]);
//    userPermissionAdder(r[2]);
//
//    //add role(s) to users
//    u[0].roles.push(r[0]._id);
//    u[0].roles.push(r[1]._id);
//    u[0].roles.push(r[2]._id);
//    u[1].roles.push(r[1]._id);
//    u[1].roles.push(r[2]._id);
//    u[2].roles.push(r[2]._id);
//
//
//    _.each(u, function (user) {
//        ops.push(function () {
//            user.savePromised().catch(function (error) {
//                when.reject(error);
//            });
//        });
//    });
//    _.each(p, function (permission) {
//        ops.push(function () {
//            permission.savePromised().catch(function (error) {
//                when.reject(error);
//            });
//        });
//    });
//    _.each(r, function (role) {
//        ops.push(function () {
//            role.savePromised().catch(function (error) {
//                when.reject(error);
//            });
//        });
//    });
//    return sequence(ops);
//};



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
    u[0].roles.push(r[0]._id).push(r[1]._id).push(r[2]._id);
    // ... admin2 is an Administrator and iColleger
    u[1].roles.push(r[1]._id).push(r[2]._id);
    // ... and icolleger is an iColleger
    u[2].roles.push(r[2]._id);

    // all users, roles and permissions are forged ...
    // ... we can save them into database:
    // permissions ...
    _.forEach(psa, function (permission) {
        ops.push(permission.saveAsync());
    });
    _.forEach(pa, function (permission) {
        ops.push(permission.saveAsync());
    });
    _.forEach(pi, function (permission) {
        ops.push(permission.saveAsync());
    });
    // ... roles ...
    _.forEach(r, function (role) {
        ops.push(role.saveAsync());
    });
    // ... and users
    _.forEach(u, function (user) {
        ops.push(user.saveAsync());
    });

    return sequence(ops);
};

module.exports = {
    populateFixtures: populateFixtures
};
