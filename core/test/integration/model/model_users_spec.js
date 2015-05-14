/*globals describe, before, beforeEach, afterEach, it*/
/*jshint expr:true*/
var testUtils   = require('../../utils'),
    should      = require('should'),
    Promise     = require('bluebird'),
    sinon       = require('sinon'),
    uuid        = require('node-uuid'),
    _           = require('lodash'),

    // Stuff we are testing
    utils       = require('../../../server/utils'),
    UserModel   = require('../../../server/models/user').User,
    RoleModel   = require('../../../server/models/role').Role,
    context     = testUtils.context.superAdmin,
    sandbox     = sinon.sandbox.create();

describe('User Model', function run() {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    afterEach(function () {
        sandbox.restore();
    });

    before(function () {
        should.exist(UserModel);
    });

    describe('Registration', function runRegistration() {
        beforeEach(testUtils.DataGenerator.resetCounter);
        beforeEach(testUtils.setup('roles'));

        it('can add first', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[0];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            UserModel.add(userData, context).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.uuid).be.a.String;
                createdUser.password.should.not.equal(userData.password, 'password was hashed');
                createdUser.email.should.eql(userData.email, 'email address correct');

                done();
            }).catch(done);
        });

        it('shortens slug if possible', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[2];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            UserModel.add(userData, context).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.slug).be.a.String;
                createdUser.slug.should.equal('jimothy');
                done();
            }).catch(done);
        });

        it('does not short slug if not possible', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[2];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            UserModel.add(userData, context).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.slug).be.a.String;
                createdUser.slug.should.equal('jimothy');
            }).then(function () {
                userData.email = 'newmail@mail.com';
                UserModel.add(userData, context).then(function (createdUser) {
                    should.exist(createdUser);
                    should(createdUser.slug).be.a.String;
                    createdUser.slug.should.equal('jimothy-bogendath');
                }).then(function () {
                    userData.email = 'newmail2@mail.com';
                    UserModel.add(userData, context).then(function (createdUser) {
                        should.exist(createdUser);
                        should(createdUser.slug).be.a.String;
                        createdUser.slug.should.equal('jimothy-bogendath-2');
                        done();
                    });
                });
            }).catch(done);
        });

        it('does NOT lowercase email', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[2];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            UserModel.add(userData, context).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.uuid).be.a.String;
                createdUser.email.should.eql(userData.email, 'email address correct');
                done();
            }).catch(done);
        });

        it('can find gravatar', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[4];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                userData.avatar = 'http://www.gravatar.com/avatar/2fab21a4c4ed88e76add10650c73bae1?d=404';
                return Promise.resolve(userData);
            });

            UserModel.add(userData, context).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.uuid).be.a.String;
                createdUser.avatar.should.eql(
                    'http://www.gravatar.com/avatar/2fab21a4c4ed88e76add10650c73bae1?d=404', 'Gravatar found'
                );
                done();
            }).catch(done);
        });

        it('can handle no gravatar', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[0];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            UserModel.add(userData, context).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.uuid).be.a.String;
                should.not.exist(createdUser.avatar);
                done();
            }).catch(done);
        });

        it('can find by name and is case sensitive', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[2],
                name = testUtils.DataGenerator.forModel.users[2].name;

            UserModel.add(userData, context).then(function () {
                // Test same case
                return UserModel.getByName(name).then(function (user) {
                    should.exist(user);
                    user.name.should.eql(name);
                });
            }).then(function () {
                // Test entered in lowercase
                return UserModel.getByName(name.toLowerCase()).then(function (user) {
                    should.not.exist(user);
                });
            }).then(function () {
                // Test entered in uppercase
                return UserModel.getByName(name.toUpperCase()).then(function (user) {
                    should.not.exist(user);
                });
            }).then(function () {
                // Test incorrect email address - swapped capital O for number 0
                return UserModel.getByName('Jimothy Bogendath').then(null, function (error) {
                    should.exist(error);
                    error.message.should.eql('NotFound');
                });
            }).then(function () {
                done();
            }).catch(done);
        });
    });

    describe('Basic Operations', function () {
        beforeEach(testUtils.DataGenerator.resetCounter);
        beforeEach(testUtils.setup('users:roles'));

        it('sets last login time on successful login', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[0];

            UserModel.check({name: userData.name, password: userData.password}).then(function (activeUser) {
                should.exist(activeUser[0].get('last_login'));
                done();
            }).catch(done);
        });

        it('converts fetched dateTime fields to Date objects', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[0];

            UserModel.check({name: userData.name, password: userData.password}).then(function (user) {
                return UserModel.findSingle({_id: user[0].id});
            }).then(function (user) {
                var lastLogin,
                    createdAt,
                    updatedAt;

                should.exist(user);

                lastLogin = user.get('last_login');
                createdAt = user.get('created_at');
                updatedAt = user.get('updated_at');

                lastLogin.should.be.an.instanceof(Date);
                createdAt.should.be.an.instanceof(Date);
                updatedAt.should.be.an.instanceof(Date);

                done();
            }).catch(done);
        });

        it('can findAll', function (done) {
            UserModel.findAll().then(function (results) {
                should.exist(results);
                results.length.should.equal(4);

                done();
            }).catch(done);
        });

        it('can findPage (default)', function (done) {
            UserModel.findPage().then(function (results) {
                should.exist(results);

                results.meta.pagination.page.should.equal(1);
                results.meta.pagination.limit.should.equal(15);
                results.meta.pagination.pages.should.equal(1);
                results.users.length.should.equal(4);

                done();
            }).catch(done);
        });

        it('can findPage by role', function (done) {
            return testUtils.fixtures.createExtraUsers().then(function () {
                return UserModel.findPage({role: 'Administrator'});
            }).then(function (results) {
                results.meta.pagination.page.should.equal(1);
                results.meta.pagination.limit.should.equal(15);
                results.meta.pagination.pages.should.equal(1);
                results.meta.pagination.total.should.equal(1);
                results.users.length.should.equal(1);

                return UserModel.findPage({role: 'SuperAdministrator'});
            }).then(function (results) {
                results.meta.pagination.page.should.equal(1);
                results.meta.pagination.limit.should.equal(15);
                results.meta.pagination.pages.should.equal(1);
                results.meta.pagination.total.should.equal(1);
                results.users.length.should.equal(1);

                return UserModel.findPage({role: 'iColleger', limit: 2});
            }).then(function (results) {
                results.meta.pagination.page.should.equal(1);
                results.meta.pagination.limit.should.equal(2);
                results.meta.pagination.pages.should.equal(3);
                results.meta.pagination.total.should.equal(5);
                results.users.length.should.equal(2);

                done();
            }).catch(done);
        });

        it('can findPage with limit all', function (done) {
            return testUtils.fixtures.createExtraUsers().then(function () {
                return UserModel.findPage({limit: 'all'});
            }).then(function (results) {
                results.meta.pagination.page.should.equal(1);
                results.meta.pagination.limit.should.equal('all');
                results.meta.pagination.pages.should.equal(1);
                results.users.length.should.equal(7);

                done();
            }).catch(done);
        });

        it('can NOT findPage for a page that overflows the datatype', function (done) {
            UserModel.findPage({page: 5700000000055345439587894375457849375284932759842375894372589243758947325894375894275894275894725897432859724309})
                .then(function (paginationResult) {
                    should.exist(paginationResult.meta);

                    paginationResult.meta.pagination.page.should.be.a.Number;

                    done();
                }).catch(done);
        });

        it('can findOne', function (done) {
            var firstUser;

            UserModel.findAll().then(function (results) {
                should.exist(results);
                results.length.should.be.above(0);
                firstUser = results[0];

                return UserModel.findSingle({email: firstUser.email});
            }).then(function (found) {
                should.exist(found);
                found.name.should.equal(firstUser.name);

                done();
            }).catch(done);
        });

        it('can edit', function (done) {
            var firstUser = '000000000000000000000000';

            UserModel.findSingle({_id: firstUser}).then(function (results) {
                var user;
                should.exist(results);
                user = results;
                user.id.should.equal(firstUser);
                should.equal(user.website, 'http://blog.icollege.com');

                return UserModel.edit({website: 'http://some.newurl.com'}, {id: firstUser});
            }).then(function (edited) {
                should.exist(edited);
                edited.website.should.equal('http://some.newurl.com');

                done();
            }).catch(done);
        });

        it('can add', function (done) {
            var userData = testUtils.DataGenerator.forModel.users[4];

            sandbox.stub(UserModel, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            RoleModel.findSingle().then(function (role) {
                userData.roles = [role.get('id')];

                return UserModel.add(userData, _.extend({}, context, {withRelated: ['roles']}));
            }).then(function (createdUser) {
                should.exist(createdUser);
                should(createdUser.uuid).be.a.String;
                createdUser.get('password').should.not.equal(userData.password, 'password was hashed');
                createdUser.get('email').should.eql(userData.email, 'email address correct');
                createdUser.roles[0].name.should.eql('SuperAdministrator', 'role set correctly');

                done();
            }).catch(done);
        });

        it('can destroy', function (done) {
            var firstUser = {_id: '000000000000000000000000'};

            // Test that we have the user we expect
            UserModel.findSingle(firstUser).then(function (results) {
                var user;
                should.exist(results);
                user = results;
                user.id.should.equal(firstUser._id);

                // Destroy the user
                return UserModel.destroy(firstUser);
            }).then(function (response) {
                response.result.should.eql({ ok: 1, n: 1 });

                // Double check we can't find the user again
                return UserModel.findSingle(firstUser);
            }).then(function (newResults) {
                should.equal(newResults, null);

                done();
            }).catch(done);
        });
    });

    describe('Password Reset', function () {
        beforeEach(testUtils.DataGenerator.resetCounter);
        beforeEach(testUtils.setup('users:roles'));

        it('can generate reset token', function (done) {
            // Expires in one minute
            var expires = Date.now() + 60000,
                dbHash = uuid.v4();

            UserModel.findAll().then(function (results) {
                return UserModel.generateResetToken(results[0].name, expires, dbHash);
            }).then(function (token) {
                should.exist(token);

                token.length.should.be.above(0);

                done();
            }).catch(done);
        });

        it('can validate a reset token', function (done) {
            // Expires in one minute
            var expires = Date.now() + 60000,
                dbHash = uuid.v4();

            UserModel.findAll().then(function (results) {
                return UserModel.generateResetToken(results[1].name, expires, dbHash);
            }).then(function (token) {
                return UserModel.validateToken(token, dbHash);
            }).then(function () {
                done();
            }).catch(done);
        });

        it('can validate an URI encoded reset token', function (done) {
            // Expires in one minute
            var expires = Date.now() + 60000,
                dbHash = uuid.v4();

            UserModel.findAll().then(function (results) {
                return UserModel.generateResetToken(results[1].name, expires, dbHash);
            }).then(function (token) {
                token = utils.encodeBase64URLsafe(token);
                token = encodeURIComponent(token);
                token = decodeURIComponent(token);
                token = utils.decodeBase64URLsafe(token);
                return UserModel.validateToken(token, dbHash);
            }).then(function () {
                done();
            }).catch(done);
        });

        it('can reset a password with a valid token', function (done) {
            // Expires in one minute
            var origPassword,
                expires = Date.now() + 60000,
                dbHash = uuid.v4();

            UserModel.findAll().then(function (results) {
                var firstUser = results[0],
                    origPassword = firstUser.password;

                should.exist(origPassword);

                return UserModel.generateResetToken(firstUser.name, expires, dbHash);
            }).then(function (token) {
                token = utils.encodeBase64URLsafe(token);
                return UserModel.resetPassword(token, 'newpassword', 'newpassword', dbHash);
            }).then(function (resetUser) {
                resetUser = resetUser[0];
                var resetPassword = resetUser.get('password');

                should.exist(resetPassword);

                resetPassword.should.not.equal(origPassword);

                done();
            }).catch(done);
        });

        it('doesn\'t allow expired timestamp tokens', function (done) {
            var name,
                // Expired one minute ago
                expires = Date.now() - 60000,
                dbHash = uuid.v4();

            UserModel.findAll().then(function (results) {
                // Store email for later
                name = results[0].name;

                return UserModel.generateResetToken(name, expires, dbHash);
            }).then(function (token) {
                return UserModel.validateToken(token, dbHash);
            }).then(function () {
                throw new Error('Allowed expired token');
            }).catch(function (err) {
                should.exist(err);

                err.message.should.equal('Expired token');

                done();
            });
        });

        it('doesn\'t allow tampered timestamp tokens', function (done) {
            // Expired one minute ago
            var expires = Date.now() - 60000,
                dbHash = uuid.v4();

            UserModel.findAll().then(function (results) {
                return UserModel.generateResetToken(results[0].name, expires, dbHash);
            }).then(function (token) {
                var tokenText = new Buffer(token, 'base64').toString('ascii'),
                    parts = tokenText.split('|'),
                    fakeExpires,
                    fakeToken;

                fakeExpires = Date.now() + 60000;

                fakeToken = [String(fakeExpires), parts[1], parts[2]].join('|');
                fakeToken = new Buffer(fakeToken).toString('base64');

                return UserModel.validateToken(fakeToken, dbHash);
            }).then(function () {
                throw new Error('allowed invalid token');
            }).catch(function (err) {
                should.exist(err);

                err.message.should.equal('Invalid token');

                done();
            });
        });
    });
});
