/*globals describe, it*/
/*jshint expr:true*/
var should          = require('should'),
    _               = require('lodash'),
    crypto          = require('crypto'),

// Stuff we are testing
    defaultSettings = require('../../server/data/default-settings'),
    schema          = require('../../server/data/schema');

// To stop jshint complaining
should.equal(true, true);

describe('Migrations', function () {
    // These tests exist to ensure that developers are not able to modify the database schema, or permissions fixtures
    // without knowing that they also need to update the default database version,
    // both of which are required for migrations to work properly.
    // TODO: add db hash for ourselves ?
    describe('DB version integrity', function () {
        // Only these variables should need updating
        var currentDbVersion = '000';

        // If this test is failing, then it is likely a change has been made that requires a DB version bump,
        // and the values above will need updating as confirmation
        it('should not change without fixing this test', function () {
            // Test!
            defaultSettings.core.databaseVersion.defaultValue.should.eql(currentDbVersion);
        });
    });
});
