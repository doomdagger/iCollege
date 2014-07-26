/**
 * # Database Fixtures
 * Created by Li He on 2014/7/24.
 * Use this class to populate or update database data
 */
var sequence    = require('when/sequence'),
    _           = require('lodash'),
    node_uuid   = require('node-uuid'),
    Role        = require('../../models/role').Role,
    Permission  = require('../../models/permission').Permission,

    populateFixtures,
    updateFixtures;

// before handle, populate demo user or posts or message data
// into database.
var fixtures = {
    users: [
        {
            uuid: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
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
            name: "Browse users",
            object_type: "user",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse apps",
            object_type: "app",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse notification",
            object_type: "notification",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse groups",
            object_type: "group",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse circles",
            object_type: "circle",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse messages",
            object_type: "message",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse posts",
            object_type: "post",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse reposts",
            object_type: "repost",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Browse settings",
            object_type: "setting",
            action_type: "browse"
        },
        {
            uuid: node_uuid.v4(),
            name: "Read user",
            object_type: "user",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "Read app",
            object_type: "app",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "Read notification",
            object_type: "notification",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "Read group",
            object_type: "group",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "Read circle",
            object_type: "circle",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "Read post",
            object_type: "post",
            action_type: "read"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit user",
            object_type: "user",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit app",
            object_type: "app",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit notification",
            object_type: "notification",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit group",
            object_type: "group",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit circle",
            object_type: "circle",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit message",
            object_type: "message",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit post",
            object_type: "post",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit repost",
            object_type: "repost",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Edit setting",
            object_type: "setting",
            action_type: "edit"
        },
        {
            uuid: node_uuid.v4(),
            name: "Add user",
            object_type: "user",
            action_type: "add"
        },
        {
            uuid: node_uuid.v4(),
            name: "Add app",
            object_type: "app",
            action_type: "add"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove user",
            object_type: "user",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove app",
            object_type: "app",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove notification",
            object_type: "notification",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove group",
            object_type: "group",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove circle",
            object_type: "circle",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove message",
            object_type: "message",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove post",
            object_type: "post",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Remove repost",
            object_type: "repost",
            action_type: "remove"
        },
        {
            uuid: node_uuid.v4(),
            name: "Create notification",
            object_type: "notification",
            action_type: "create"
        },
        {
            uuid: node_uuid.v4(),
            name: "Create group",
            object_type: "group",
            action_type: "create"
        },
        {
            uuid: node_uuid.v4(),
            name: "Create circle",
            object_type: "circle",
            action_type: "create"
        },
        {
            uuid: node_uuid.v4(),
            name: "Create message",
            object_type: "message",
            action_type: "create"
        },
        {
            uuid: node_uuid.v4(),
            name: "Create post",
            object_type: "post",
            action_type: "create"
        },
        {
            uuid: node_uuid.v4(),
            name: "Create repost",
            object_type: "repost",
            action_type: "create"
        },
        {
            uuid: node_uuid.v4(),
            name: "Export database",
            object_type: "db",
            action_type: "exportContent"
        },
        {
            uuid: node_uuid.v4(),
            name: "Import database",
            object_type: "db",
            action_type: "importContent"
        },
        {
            uuid: node_uuid.v4(),
            name: "Delete all content",
            object_type: "db",
            action_type: "deleteAllContent"
        }
    ],

    roles: [
        {
            uuid: node_uuid.v4(),
            name: 'SuperAdministrator',
            description: 'Super Administrator who is in charge of everything'
        },
        {
            uuid: node_uuid.v4(),
            name: 'Administrator',
            description: 'Administrator who is assigned by Super Administrator'
        },
        {
            uuid: node_uuid.v4(),
            name: 'iColleger',
            description: 'Normal User of iCollege'
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
