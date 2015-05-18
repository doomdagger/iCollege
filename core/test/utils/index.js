var Promise       = require('bluebird'),
    sequence      = require('../../server/utils/sequence'),
    _             = require('lodash'),
    fs            = require('fs-extra'),
    path          = require('path'),
    migration     = require('../../server/data/migration/'),
    Models        = require('../../server/models'),
    SettingsAPI   = require('../../server/api/settings'),
    permissions   = require('../../server/permissions'),
    permsFixtures = require('../../server/data/fixtures/fixtures.json'),
    DataGenerator = require('./fixtures/data-generator'),
    API           = require('./api'),
    fork          = require('./fork'),
    //config        = require('../../server/config'),
    DataUtils     = require('../../server/data/utils'),
    mongoose      = require('mongoose'),

    fixtures,
    getFixtureOps,
    toDoList,

    teardown,
    setup,
    doAuth,
    login,
    togglePermalinks,

    initFixtures,
    initData,
    clearData,

    wait;

/** TEST FIXTURES **/
fixtures = {
    /**
     * 加工Model Instance，目前仅仅是赋值id
     * @param doc
     * @param name
     * @param [options]
     */
    amend: function amend(doc, name, options) {
        var ret;
        if (_.isArray(doc)) {
            ret = _.map(DataGenerator.forDB[name], function (item) {
                return _.extend({}, item, {_id: DataGenerator.next(name)}, options);
            });
        } else {
            ret = _.extend({}, doc, {_id: DataGenerator.next(name)}, options);
        }
        return ret;
    },

    insertPosts: function insertPosts() {
        return DataUtils.insertDocuments('posts', fixtures.amend(DataGenerator.forDB.posts, 'posts'));
    },

    insertRoles: function insertRoles() {
        return DataUtils.insertDocuments('roles', fixtures.amend(DataGenerator.forDB.roles, 'roles'));
    },

    initOwnerUser: function initOwnerUser() {
        var user = DataGenerator.Content.users[0];

        user = DataGenerator.forDB.createBasic(user);
        user = fixtures.amend(user, 'users', {status: 'inactive', roles: [DataGenerator.forDB.roles_users[0]]});

        return fixtures.insertRoles().then(function () {
            return DataUtils.insertDocuments('users', user);
        });
    },

    insertOwnerUser: function insertOwnerUser() {
        var user;

        user = DataGenerator.forDB.createUser(DataGenerator.Content.users[0]);
        user = fixtures.amend(user, 'users', {roles: [DataGenerator.forDB.roles_users[0]]});

        return DataUtils.insertDocuments('users', user);
    },

    overrideOwnerUser: function overrideOwnerUser() {
        var user;

        user = DataGenerator.forDB.createUser(DataGenerator.Content.users[0]);

        return DataUtils.updateDocuments('users',
            {'_id': mongoose.Types.ObjectId('000000000000000000000000')},
            {$set: user});
    },

    createUsersWithRoles: function createUsersWithRoles() {
        return fixtures.insertRoles().then(function () {
            return DataUtils.insertDocuments('users', fixtures.amend(DataGenerator.forDB.users, 'users'));
        });
    },

    createExtraUsers: function createExtraUsers() {
        // grab 3 more users
        var extraUsers = DataGenerator.Content.users.slice(2, 5);

        extraUsers = _.map(extraUsers, function (user) {
            return DataGenerator.forDB.createUser(_.extend({}, user, {
                _id: DataGenerator.next('users'),
                name: 'a' + user.name,
                email: 'a' + user.email,
                slug: 'a' + user.slug,
                roles: [mongoose.Types.ObjectId('222222222222222222222222') + '']
            }));
        });

        return DataUtils.insertDocuments('users', extraUsers);
    },

    // Creates a client, and access and refresh tokens for user 3 (author)
    createTokensForUser: function createTokensForUser() {
        return DataUtils.insertDocuments('clients', fixtures.amend(DataGenerator.forDB.clients, 'clients')).then(function () {
            return DataUtils.insertDocuments('accesstokens',
                DataGenerator.forDB.createToken({_id: DataGenerator.next('accesstokens'), user_id: mongoose.Types.ObjectId('333333333333333333333333') + ''}));
        }).then(function () {
            return DataUtils.insertDocuments('refreshtokens',
                DataGenerator.forDB.createToken({_id: DataGenerator.next('refreshtokens'), user_id: mongoose.Types.ObjectId('333333333333333333333333') + ''}));
        });
    },

    createInvitedUsers: function createInvitedUser() {
        // grab 3 more users
        var extraUsers = DataGenerator.Content.users.slice(2, 5);

        extraUsers = _.map(extraUsers, function (user) {
            return DataGenerator.forDB.createUser(_.extend({}, user, {
                _id: DataGenerator.next('users'),
                email: 'inv' + user.email,
                slug: 'inv' + user.slug,
                status: 'invited-pending',
                roles: [mongoose.Types.ObjectId('222222222222222222222222') + '']
            }));
        });

        return DataUtils.insertDocuments('users', extraUsers);
    },

    insertOne: function insertOne(obj, fn) {
        return DataUtils.insertDocuments(obj, fixtures.amend(DataGenerator.forDB[fn](DataGenerator.Content[obj][0]), obj));
    },

    getImportFixturePath: function (filename) {
        return path.resolve(__dirname + '/fixtures/import/' + filename);
    },

    getExportFixturePath: function (filename) {
        return path.resolve(__dirname + '/fixtures/export/' + filename + '.json');
    },

    loadExportFixture: function loadExportFixture(filename) {
        var filePath = this.getExportFixturePath(filename),
            readFile = Promise.promisify(fs.readFile);

        return readFile(filePath).then(function (fileContents) {
            var data;

            // Parse the json data
            try {
                data = JSON.parse(fileContents);
            } catch (e) {
                return new Error('Failed to parse the file');
            }

            return data;
        });
    },

    permissionsFor: function permissionsFor(obj) {
        var permsToInsert = permsFixtures.permissions[obj],
            permsRolesToInsert = permsFixtures.permissions_roles,
            actions = [],
            permissionsRoles = [],
            roles = {
                SuperAdministrator: mongoose.Types.ObjectId('000000000000000000000000'),
                Administrator: mongoose.Types.ObjectId('111111111111111111111111'),
                iColleger: mongoose.Types.ObjectId('222222222222222222222222')
            };

        permsToInsert = _.map(permsToInsert, function (perms) {
            actions.push(perms.action_type);
            return fixtures.amend(DataGenerator.forDB.createBasic(perms), 'permissions', {object_type: obj});
        });

        _.each(permsRolesToInsert, function (perms, role) {
            if (perms[obj]) {
                if (perms[obj] === 'all') {
                    _.each(actions, function (action, i) {
                        permissionsRoles.push(DataUtils.updateDocuments('roles', {_id: roles[role]}, {$push: {permissions: permsToInsert[i]._id + ''}}));
                    });
                } else {
                    _.each(perms[obj], function (action) {
                        permissionsRoles.push(DataUtils.updateDocuments('roles', {_id: roles[role]}, {$push: {permissions: permsToInsert[_.indexOf(actions, action)]._id + ''}}));
                    });
                }
            }
        });

        return DataUtils.insertDocuments('permissions', permsToInsert).then(function () {
            return Promise.all(permissionsRoles);
        });
    }
};

/** Test Utility Functions **/
initData = function initData() {
    return migration.init();
};

clearData = function clearData() {
    // we must always try to delete all tables
    return migration.reset();
};

toDoList = {
    permission: function insertPermission() { return fixtures.insertOne('permissions', 'createPermission'); },
    role: function insertRole() { return fixtures.insertOne('roles', 'createRole'); },
    roles: function insertRoles() { return fixtures.insertRoles(); },

    settings: function populateSettings() {
        return Models.Settings.populateDefaults().then(function () { return SettingsAPI.updateSettingsCache(); });
    },

    posts: function insertPosts() { return fixtures.insertPosts(); },

    'users:roles': function createUsersWithRoles() { return fixtures.createUsersWithRoles(); },
    users: function createExtraUsers() { return fixtures.createExtraUsers(); },
    'user:token': function createTokensForUser() { return fixtures.createTokensForUser(); },
    owner: function insertOwnerUser() { return fixtures.insertOwnerUser(); },
    'owner:pre': function initOwnerUser() { return fixtures.initOwnerUser(); },
    'owner:post': function overrideOwnerUser() { return fixtures.overrideOwnerUser(); },
    'perms:init': function initPermissions() { return permissions.init(); },
    perms: function permissionsFor(obj) {
        return function permissionsForObj() { return fixtures.permissionsFor(obj); };
    }
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
    // default = default fixtures, if it isn't present, init with tables only
    var tablesOnly = !toDos.default,
        fixtureOps = [];

    // Database initialisation
    if (toDos.init || toDos.default) {
        fixtureOps.push(function initDB() {
            return migration.init(tablesOnly);
        });
        delete toDos.default;
        delete toDos.init;
    }

    // Go through our list of things to do, and add them to an array
    _.each(toDos, function (value, toDo) {
        var tmp;
        if (toDo !== 'perms:init' && toDo.indexOf('perms:') !== -1) {
            tmp = toDo.split(':');
            fixtureOps.push(toDoList[tmp[0]](tmp[1]));
        } else {
            fixtureOps.push(toDoList[toDo]);
        }
    });

    return fixtureOps;
};

// ## Test Setup and Teardown

initFixtures = function initFixtures() {
    var options = _.merge({init: true}, _.transform(arguments, function (result, val) {
            result[val] = true;
        })),
        fixtureOps = getFixtureOps(options);

    return sequence(fixtureOps);
};

/**
 * ## Setup Integration Tests
 * Setup takes a list of arguments like: 'default', 'tag', 'perms:tag', 'perms:init'
 * Setup does 'init' (DB) by default
 * @returns {Function}
 */
setup = function setup() {
    var self = this,
        args = arguments;

    return function (done) {
        return Models.init().then(function () {
            return initFixtures.apply(self, args);
        }).then(function () {
            done();
        }).catch(done);
    };
};

/**
 * ## DoAuth For Route Tests
 *
 * This function manages the work of ensuring we have an overridden owner user, and grabbing an access token
 * @returns {deferred.promise<AccessToken>}
 */
// TODO make this do the DB init as well
doAuth = function doAuth() {
    var options = arguments,
        request = arguments[0],
        fixtureOps;

    // Remove request from this list
    delete options[0];
    // No DB setup, but override the owner
    options = _.merge({'owner:post': true}, _.transform(options, function (result, val) {
        result[val] = true;
    }));

    fixtureOps = getFixtureOps(options);

    return sequence(fixtureOps).then(function () {
        return login(request);
    });
};

login = function login(request) {
    var user = DataGenerator.forModel.users[0];

    return new Promise(function (resolve, reject) {
        request.post('/icollege/api/v0.1/authentication/token/')
            .send({grant_type: 'password', username: user.email, password: user.password, client_id: 'icollege-admin'})
            .end(function (err, res) {
                if (err) {
                    return reject(err);
                }

                resolve(res.body.access_token);
            });
    });
};

togglePermalinks = function togglePermalinks(request, toggle) {
    var permalinkString = toggle === 'date' ? '/:year/:month/:day/:slug/' : '/:slug/';

    return new Promise(function (resolve, reject) {
        doAuth(request).then(function (token) {
            request.put('/icollege/api/v0.1/settings/')
                .set('Authorization', 'Bearer ' + token)
                .send({settings: [
                    {
                        uuid: '75e994ae-490e-45e6-9207-0eab409c1c04',
                        key: 'permalinks',
                        value: permalinkString,
                        type: 'blog',
                        created_at: '2014-10-16T17:39:16.005Z',
                        created_by: 1,
                        updated_at: '2014-10-20T19:44:18.077Z',
                        updated_by: 1
                    }
                ]})
                .end(function (err, res) {
                    if (err) {
                        return reject(err);
                    }

                    resolve(res.body);
                });
        });
    });
};

teardown = function teardown(done) {
    migration.safeReset().then(function () {
        done();
    }).catch(done);
};

wait = function wait(done) {
    setTimeout(function () {
        done();
    }, 500);
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

    wait: wait,

    fixtures: fixtures,

    DataGenerator: DataGenerator,
    API: API,

    fork: fork,

    // Helpers to make it easier to write tests which are easy to read
    context: {
        internal:   {context: {internal: true}},
        superAdmin:      {context: {user: '000000000000000000000000'}},
        admin:      {context: {user: '333333333333333333333333'}},
        icolleger1:     {context: {user: '111111111111111111111111'}},
        icolleger2:     {context: {user: '222222222222222222222222'}}
    },
    users: {
        ids: {
            superAdmin: '000000000000000000000000',
            admin: '333333333333333333333333',
            icolleger1: '111111111111111111111111',
            icolleger2: '222222222222222222222222',
            icolleger3: '444444444444444444444444',
            icolleger4: '555555555555555555555555',
            icolleger5: '666666666666666666666666'
        }
    },
    roles: {
        ids: {
            superAdmin: '000000000000000000000000',
            admin: '111111111111111111111111',
            icolleger: '222222222222222222222222'
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
