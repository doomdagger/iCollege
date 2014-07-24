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
    Permissions = require('../../models/permission').Permissions,

    populateFixtures,
    updateFixtures;

// before handle, populate demo user or posts or message data
// into database.
var fixtures = {

    permissions: [
        {
            uuid: node_uuid.v4(),
            name: ""
        }
    ],

    roles: [
        {
            uuid: node_uuid.v4(),
            name: 'SuperAdministrator'

        }
    ]

};