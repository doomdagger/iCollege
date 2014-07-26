/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var sequence    = require('when/sequence'),
    //_           = require('lodash'),
    node_uuid   = require('node-uuid'),
    //Role        = require('../../models/role').Role,
    //Permission  = require('../../models/permission').Permission,

    populateFixtures,
    updateFixtures;

// before handle, populate demo user or posts or message data
// into database.
var fixtures = {

    users: [
        {
            uuid: node_uuid.v4(),
            nickname: "Administrator",
            lowercase_username: "admin",
            username: "admin",
            password: "123456",
            email: "admin@icollege.com",
            phone: "18877776666",
            location: [0.0, 0.0]
        }
    ],

    permissions: [
        {
            uuid: node_uuid.v4(),
            name: "",
            object_type: "",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "",
            object_type: "",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "",
            object_type: "",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "",
            object_type: "",
            action_type: "add"
        },
        {
            uuid: node_uuid.v4(),
            name: "",
            object_type: "",
            action_type: "remove"
        }
    ],

    roles: [
        {
            uuid: node_uuid.v4(),
            name: 'SuperAdministrator'

        }
    ]

};

populateFixtures = function () {
    var ops = [],
        relations = [];


    return sequence(ops).then(function () {
        sequence(relations);
    });
};

updateFixtures = function () {
    var ops = [],
        relations = [];


    return sequence(ops).then(function () {
        sequence(relations);
    });
};

module.exports = {
    populateFixtures: populateFixtures,
    updateFixtures: updateFixtures
};
