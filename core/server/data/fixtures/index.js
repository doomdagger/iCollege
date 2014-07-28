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
var fixtures = {

    users: [
        // Super Administrator
        {
            uuid: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
            nickname: "Administrator",
            lowercase_username: "admin",
            username: "admin",
            password: "123456",
            email: "admin@icollege.com",
            phone: "18877776666",
            location: [0.0, 0.0]
        },
        // Administrator
        {
            uuid: node_uuid.v4(),
            nickname: "Administrator2",
            lowercase_username: "admin2",
            username: "admin2",
            password: "123456",
            email: "admin2@icollege.com",
            phone: "18877775555",
            location: [0.0, 0.0]
        },
        // Normal User
        {
            uuid: node_uuid.v4(),
            nickname: "iColleger",
            lowercase_username: "icolleger",
            username: "iColleger",
            password: "123456",
            email: "icolleger@icollege.com",
            phone: "18877774444",
            location: [0.0, 0.0]
        }
    ],

    permissions: [
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Browse users",
            object_type: "user",
            action_type: "browse"
        },
        // user - all
        {
            uuid: node_uuid.v4(),
            name: "Browse apps",
            object_type: "app",
            action_type: "browse"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Browse notification",
            object_type: "notification",
            action_type: "browse"
        },
        // user - all
        {
            uuid: node_uuid.v4(),
            name: "Browse groups",
            object_type: "group",
            action_type: "browse"
        },
        // user - all
        {
            uuid: node_uuid.v4(),
            name: "Browse circles",
            object_type: "circle",
            action_type: "browse"
        },
        // user - related (group messages are related to me, friends' messages sent to me are also related to me)
        {
            uuid: node_uuid.v4(),
            name: "Browse messages",
            object_type: "message",
            action_type: "browse"
        },
        // post - related (friends circle's posts, other circles' posts, my own posts)
        {
            uuid: node_uuid.v4(),
            name: "Browse posts",
            object_type: "post",
            action_type: "browse"
        },
        // repost - related
        {
            uuid: node_uuid.v4(),
            name: "Browse reposts",
            object_type: "repost",
            action_type: "browse"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Browse settings",
            object_type: "setting",
            action_type: "browse"
        },
        // user - all (affected by user's profile_visibility)
        {
            uuid: node_uuid.v4(),
            name: "Read user",
            object_type: "user",
            action_type: "read"
        },
        // user - all
        {
            uuid: node_uuid.v4(),
            name: "Read app",
            object_type: "app",
            action_type: "read"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Read notification",
            object_type: "notification",
            action_type: "read"
        },
        // user - all
        {
            uuid: node_uuid.v4(),
            name: "Read group",
            object_type: "group",
            action_type: "read"
        },
        // user - all
        {
            uuid: node_uuid.v4(),
            name: "Read circle",
            object_type: "circle",
            action_type: "read"
        },
        // user - related
        {
            uuid: node_uuid.v4(),
            name: "Read post",
            object_type: "post",
            action_type: "read"
        },
        // user - related
        {
            uuid: node_uuid.v4(),
            name: "Read repost",
            object_type: "repost",
            action_type: "read"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Read setting",
            object_type: "setting",
            action_type: "read"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Edit user",
            object_type: "user",
            action_type: "edit"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Edit app",
            object_type: "app",
            action_type: "edit"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Edit notification",
            object_type: "notification",
            action_type: "edit"
        },
        // user - related
        {
            uuid: node_uuid.v4(),
            name: "Edit group",
            object_type: "group",
            action_type: "edit"
        },
        // user - related
        {
            uuid: node_uuid.v4(),
            name: "Edit circle",
            object_type: "circle",
            action_type: "edit"
        },
        // admin or internal(mostly: being_pulled)
        {
            uuid: node_uuid.v4(),
            name: "Edit message",
            object_type: "message",
            action_type: "edit"
        },
        // user - me or internal(sometimes: favor or view)
        {
            uuid: node_uuid.v4(),
            name: "Edit post",
            object_type: "post",
            action_type: "edit"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Edit repost",
            object_type: "repost",
            action_type: "edit"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Edit setting",
            object_type: "setting",
            action_type: "edit"
        },
        // admin or internal(sign up)
        {
            uuid: node_uuid.v4(),
            name: "Add user",
            object_type: "user",
            action_type: "add"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Add app",
            object_type: "app",
            action_type: "add"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Remove user",
            object_type: "user",
            action_type: "remove"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Remove app",
            object_type: "app",
            action_type: "remove"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Remove notification",
            object_type: "notification",
            action_type: "remove"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Remove group",
            object_type: "group",
            action_type: "remove"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Remove circle",
            object_type: "circle",
            action_type: "remove"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Remove message",
            object_type: "message",
            action_type: "remove"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Remove post",
            object_type: "post",
            action_type: "remove"
        },
        // user - related (post owner can remove post's reposts)
        {
            uuid: node_uuid.v4(),
            name: "Remove repost",
            object_type: "repost",
            action_type: "remove"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Create notification",
            object_type: "notification",
            action_type: "create"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Create group",
            object_type: "group",
            action_type: "create"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Create circle",
            object_type: "circle",
            action_type: "create"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Create message",
            object_type: "message",
            action_type: "create"
        },
        // user - me
        {
            uuid: node_uuid.v4(),
            name: "Create post",
            object_type: "post",
            action_type: "create"
        },
        // user - related (If I can browse, then I can favor)
        {
            uuid: node_uuid.v4(),
            name: "Favor post",
            object_type: "post",
            action_type: "favor"
        },
        // user - related (If I can browse, then I can favor)
        {
            uuid: node_uuid.v4(),
            name: "Favor repost",
            object_type: "repost",
            action_type: "favor"
        },
        // user - related
        {
            uuid: node_uuid.v4(),
            name: "Create repost",
            object_type: "repost",
            action_type: "create"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Export database",
            object_type: "db",
            action_type: "exportContent"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Import database",
            object_type: "db",
            action_type: "importContent"
        },
        // admin
        {
            uuid: node_uuid.v4(),
            name: "Delete all content",
            object_type: "db",
            action_type: "deleteAllContent"
        },

        // user - related (add member for my own group or add member for group in which I am a co-admin )
        // do not misunderstood this with some api interface, this permission describe whether a user or app
        // have the permission to add someone into a specific group
        {
            uuid: node_uuid.v4(),
            name: "Add group member",
            object_type: "member",
            action_type: "add"
        },
        // user - related (add member for my own circle or add member for circle in which I am a co-admin )
        // do not misunderstood this with some api interface, this permission describe whether a user or app
        // have the permission to add someone into a specific circle
        {
            uuid: node_uuid.v4(),
            name: "Add circle member",
            object_type: "member",
            action_type: "add"
        },
        // user - related (me or others(if I am owner of group or a co-admin))
        {
            uuid: node_uuid.v4(),
            name: "Edit group member",
            object_type: "member",
            action_type: "edit"
        },
        // user - related (me or others(if I am owner of circle or a co-admin))
        {
            uuid: node_uuid.v4(),
            name: "Edit circle member",
            object_type: "member",
            action_type: "edit"
        },
        // user - related (me or others(if I am owner of group or a co-admin))
        {
            uuid: node_uuid.v4(),
            name: "Remove group member",
            object_type: "member",
            action_type: "remove"
        },
        // user - related (me or others(if I am owner of circle or a co-admin))
        {
            uuid: node_uuid.v4(),
            name: "Remove circle member",
            object_type: "member",
            action_type: "remove"
        },
        // user - related (if I own the group or I am a member of it)
        {
            uuid: node_uuid.v4(),
            name: "Browse group members",
            object_type: "member",
            action_type: "browse"
        },
        // user - related (if I own the circle or I am a member of it)
        {
            uuid: node_uuid.v4(),
            name: "Browse circle members",
            object_type: "member",
            action_type: "browse"
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
