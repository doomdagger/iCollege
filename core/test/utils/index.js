var Promise       = require('bluebird'),
    sequence      = require('../../server/utils/sequence'),
    _             = require('lodash'),
    fs            = require('fs-extra'),
    path          = require('path'),
    migration     = require('../../server/data/migration/'),
    Models        = require('../../server/models'),
    SettingsAPI   = require('../../server/api/settings'),
    permissions   = require('../../server/permissions'),
    permsFixtures = require('../../server/data/fixtures/permissions/permissions.json'),
    DataGenerator = require('./fixtures/data-generator'),
    API           = require('./api'),
    fork          = require('./fork'),
    config        = require('../../server/config'),

    fixtures      = require('./fixtures'),
    getFixtureOps,
    toDoList,
    postsInserted = 0,

    teardown,
    setup,
    doAuth,
    login,
    togglePermalinks,

    initFixtures,
    initData,
    clearData;

/** Test Utility Functions **/
initData = function initData() {
    return migration.init();
};

clearData = function clearData() {
    // we must always try to delete all collections
    return migration.reset();
};

toDoList = {
    // todo PEND discussion needed
};

/**
 * ## getFixtureOps
 *
 * Takes the arguments from a setup function and turns them into an array of promises to fullfil
 *
 * This is effectively a list of instructions with regard to which fixtures should be setup for this test.
 *  * `default` - a special option which will cause the full suite of normal fixtures to be initialised
 *  * `perms:init` - initialise the permissions object after having added permissions
 *  * `perms:obj` - initialise permissions for a particular object type
 *  * `users:roles` - create a full suite of users, one per role
 * @param {Object} toDos
 */
getFixtureOps = function getFixtureOps(toDos) {

};

// ## Test Setup and Teardown

initFixtures = function initFixtures() {

};

/**
 * ## Setup Integration Tests
 * Setup takes a list of arguments like: 'default', 'tag', 'perms:tag', 'perms:init'
 * Setup does 'init' (DB) by default
 * @returns {Function}
 */
setup = function setup() {

};

/**
 * ## DoAuth For Route Tests
 *
 * This function manages the work of ensuring we have an overridden owner user, and grabbing an access token
 * @returns {deferred.promise<AccessToken>}
 */
// TODO make this do the DB init as well
doAuth = function doAuth() {

};

login = function login(request) {

};

togglePermalinks = function togglePermalinks(request, toggle) {

};

teardown = function teardown(done) {
    migration.reset().then(function () {
        done();
    }).catch(done);
};

module.exports = {
    teardown: teardown,
    setup: setup,
    doAuth: doAuth,
    login: login,
    togglePermalinks: togglePermalinks,

    initFixtures: initFixtures,
    initData: initData,
    clearData: clearData,

    fixtures: fixtures,

    DataGenerator: DataGenerator,
    API: API,

    fork: fork,

    // Helpers to make it easier to write tests which are easy to read
    context: {
        internal:   {context: {internal: true}},
        owner:      {context: {user: 1}},
        admin:      {context: {user: 2}},
        editor:     {context: {user: 3}},
        author:     {context: {user: 4}}
    },
    users: {
        ids: {
            owner: 1,
            admin: 2,
            editor: 3,
            author: 4,
            admin2: 5,
            editor2: 6,
            author2: 7
        }
    },
    roles: {
        ids: {
            owner: 4,
            admin: 1,
            editor: 2,
            author: 3
        }
    },

    cacheRules: {
        public: 'public, max-age=0',
        hour:  'public, max-age=' + 3600,
        day: 'public, max-age=' + 86400,
        year:  'public, max-age=' + 31536000,
        private: 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
    }
};
