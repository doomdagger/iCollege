/*globals describe, before, beforeEach, afterEach, it */
/*jshint expr:true*/
var testUtils       = require('../../utils'),
    should          = require('should'),
    sinon           = require('sinon'),
    Promise         = require('bluebird'),
    _               = require('lodash'),

// Stuff we are testing
    ModelUser       = require('../../../server/models'),
    UserAPI         = require('../../../server/api/users'),
    mail            = require('../../../server/api/mail'),

    context         = testUtils.context,
    userIdFor       = testUtils.users.ids,
    roleIdFor       = testUtils.roles.ids,
    sandbox         = sinon.sandbox.create();

describe('Users API', function () {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);

    beforeEach(testUtils.DataGenerator.resetCounter);
    beforeEach(testUtils.setup('users:roles', 'users', 'user:token', 'perms:user', 'perms:role', 'perms:setting', 'perms:init'));
    afterEach(testUtils.teardown);

    it('dateTime fields are returned as Date objects', function (done) {
        var userData = testUtils.DataGenerator.forModel.users[0];

        ModelUser.User.check({name: userData.name, password: userData.password}).then(function (user) {
            return UserAPI.read({_id: user._id});
        }).then(function (response) {
            response.users[0].created_at.should.be.an.instanceof(Date);
            response.users[0].updated_at.should.be.an.instanceof(Date);
            response.users[0].last_login.should.be.an.instanceof(Date);

            done();
        }).catch(done);
    });

    describe('Browse', function () {
        function checkBrowseResponse(response, count) {
            should.exist(response);
            testUtils.API.checkResponse(response, 'users');
            should.exist(response.users);
            response.users.should.have.length(count);
            testUtils.API.checkResponse(response.users[0], 'user');
            testUtils.API.checkResponse(response.users[1], 'user');
            testUtils.API.checkResponse(response.users[2], 'user');
            testUtils.API.checkResponse(response.users[3], 'user');
        }

        it('SuperAdministrator can browse', function (done) {
            UserAPI.browse(context.superAdmin).then(function (response) {
                checkBrowseResponse(response, 7);
                done();
            }).catch(done);
        });

        it('Administrator can browse', function (done) {
            UserAPI.browse(context.admin).then(function (response) {
                checkBrowseResponse(response, 7);
                done();
            }).catch(done);
        });

        it('iColleger can browse', function (done) {
            UserAPI.browse(context.icolleger1).then(function (response) {
                checkBrowseResponse(response, 7);
                done();
            }).catch(done);
        });

        it('No-auth CANNOT browse', function (done) {
            UserAPI.browse().then(function () {
                done(new Error('Browse users is not denied without authentication.'));
            }, function () {
                done();
            }).catch(done);
        });

        it('Can browse invited/invited-pending (admin)', function (done) {
            testUtils.fixtures.createInvitedUsers().then(function () {
                UserAPI.browse(_.extend({}, testUtils.context.admin, {status: 'invited'})).then(function (response) {
                    should.exist(response);
                    testUtils.API.checkResponse(response, 'users');
                    should.exist(response.users);
                    response.users.should.have.length(3);
                    testUtils.API.checkResponse(response.users[0], 'user');
                    response.users[0].status.should.equal('invited-pending');

                    done();
                }).catch(done);
            });
        });

        it('Can browse all', function (done) {
            UserAPI.browse(_.extend({}, testUtils.context.admin, {status: 'all'})).then(function (response) {
                checkBrowseResponse(response, 7);
                done();
            }).catch(done);
        });

        it('Can browse with roles', function (done) {
            UserAPI.browse(_.extend({}, testUtils.context.admin, {status: 'all', withRelated: 'roles'})).then(function (response) {
                should.exist(response);
                testUtils.API.checkResponse(response, 'users');
                should.exist(response.users);
                response.users.should.have.length(7);
                response.users.should.have.length(7);
                testUtils.API.checkResponse(response.users[0], 'user');
                testUtils.API.checkResponse(response.users[1], 'user');
                testUtils.API.checkResponse(response.users[2], 'user');
                testUtils.API.checkResponse(response.users[3], 'user');
                done();
            }).catch(done);
        });
    });

    describe('Read', function () {
        function checkReadResponse(response) {
            should.exist(response);
            should.not.exist(response.meta);
            should.exist(response.users);
            response.users[0]._id.should.eql('000000000000000000000000');
            testUtils.API.checkResponse(response.users[0], 'user');
            response.users[0].created_at.should.be.a.Date;
        }

        it('SuperAdministrator can read', function (done) {
            UserAPI.read(_.extend({}, context.superAdmin, {_id: userIdFor.superAdmin})).then(function (response) {
                checkReadResponse(response);
                done();
            }).catch(done);
        });

        it('Administrator can read', function (done) {
            var stuff = _.extend({}, context.admin, {_id: userIdFor.superAdmin});
            UserAPI.read(stuff).then(function (response) {
                checkReadResponse(response);
                done();
            }).catch(done);
        });

        it('iColleger can read', function (done) {
            UserAPI.read(_.extend({}, context.icolleger1, {_id: userIdFor.superAdmin})).then(function (response) {
                checkReadResponse(response);
                done();
            }).catch(done);
        });

        it('No-auth can read', function (done) {
            UserAPI.read({id: userIdFor.superAdmin}).then(function (response) {
                checkReadResponse(response);
                done();
            }).catch(done);
        });
    });

    describe('Edit', function () {
        var newName = 'Jo McBlogger';

        function checkEditResponse(response) {
            should.exist(response);
            should.not.exist(response.meta);
            should.exist(response.users);
            response.users.should.have.length(1);
            testUtils.API.checkResponse(response.users[0], 'user');
            response.users[0].name.should.equal(newName);
            response.users[0].updated_at.should.be.a.Date;
        }

        it('SuperAdministrator can edit all roles', function (done) {
            UserAPI.edit({users: [{name: newName}]}, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function (response) {
                    checkEditResponse(response);

                    return UserAPI.edit({users: [{name: newName}]}, _.extend({}, context.superAdmin, {_id: userIdFor.admin}));
                }).then(function (response) {
                    checkEditResponse(response);

                    return UserAPI.edit({users: [{name: newName}]}, _.extend({}, context.superAdmin, {_id: userIdFor.icolleger1}));
                }).then(function (response) {
                    checkEditResponse(response);

                    done();
                }).catch(done);
        });

        it('Administrator CANNOT edit SuperAdministrator or Administrator roles', function (done) {
            // Cannot edit SuperAdministrator
            UserAPI.edit(
                {users: [{name: newName}]}, _.extend({}, context.admin, {_id: userIdFor.superAdmin})
            ).then(function () {
                done(new Error('Editor should not be able to edit owner account'));
            }).catch(function (error) {
                error.type.should.eql('NoPermissionError');
                done();
            });
        });

        it('Administrator can edit self or iColleger role', function (done) {
            // Can edit self
            UserAPI.edit(
                {users: [{name: newName}]}, _.extend({}, context.admin, {_id: userIdFor.admin})
            ).then(function (response) {
                checkEditResponse(response);
                // Can edit Author
                return UserAPI.edit(
                    {users: [{name: newName}]}, _.extend({}, context.icolleger1, {_id: userIdFor.icolleger1})
                );
            }).then(function (response) {
                checkEditResponse(response);
                done();
            }).catch(done);
        });

        it('iColleger CANNOT edit all roles', function (done) {
            // Cannot edit owner
            UserAPI.edit(
                {users: [{name: newName}]}, _.extend({}, context.icolleger1, {_id: userIdFor.superAdmin})
            ).then(function () {
                done(new Error('Editor should not be able to edit owner account'));
            }).catch(function (error) {
                error.type.should.eql('NoPermissionError');
            }).finally(function () {
                // Cannot edit admin
                UserAPI.edit(
                    {users: [{name: newName}]}, _.extend({}, context.icolleger1, {_id: userIdFor.admin})
                ).then(function () {
                    done(new Error('Editor should not be able to edit admin account'));
                }).catch(function (error) {
                    error.type.should.eql('NoPermissionError');
                }).finally(function () {
                    UserAPI.edit(
                        {users: [{name: newName}]}, _.extend({}, context.icolleger1, {_id: userIdFor.icolleger2})
                    ).then(function () {
                        done(new Error('Author should not be able to edit author account which is not their own'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
                });
            });
        });

        it('iColleger can edit self', function (done) {
            // Next test that author CAN edit self
            UserAPI.edit(
                {users: [{name: newName}]}, _.extend({}, context.icolleger1, {_id: userIdFor.icolleger1})
            ).then(function (response) {
                checkEditResponse(response);
                done();
            }).catch(done);
        });

        it('iColleger can edit self with role set', function (done) {
            // Next test that author CAN edit self
            UserAPI.edit(
                {users: [{name: newName, roles: [roleIdFor.icolleger]}]}, _.extend({}, context.icolleger1, {_id: userIdFor.icolleger1})
            ).then(function (response) {
                checkEditResponse(response);
                done();
            }).catch(done);
        });

    });

    describe('Add', function () {
        var newUser;

        beforeEach(function () {
            newUser = _.clone(testUtils.DataGenerator.forDB.createUser(testUtils.DataGenerator.Content.users[4]));

            sandbox.stub(ModelUser.User, 'gravatarLookup', function (userData) {
                return Promise.resolve(userData);
            });

            sandbox.stub(mail, 'send', function () {
                return Promise.resolve();
            });
        });
        afterEach(function () {
            sandbox.restore();
        });

        function checkAddResponse(response) {
            should.exist(response);
            should.exist(response.users);
            should.not.exist(response.meta);
            response.users.should.have.length(1);
            testUtils.API.checkResponse(response.users[0], 'user');
            response.users[0].created_at.should.be.a.Date;
        }

        describe('SuperAdministrator', function () {
            it('CANNOT add a SuperAdministrator', function (done) {
                newUser.roles = [roleIdFor.superAdmin];

                // Owner cannot add owner
                UserAPI.add({users: [newUser]}, _.extend({}, context.superAdmin, {withRelated: 'roles'}))
                    .then(function () {
                        done(new Error('Owner should not be able to add an owner'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('Can add an Administrator', function (done) {
                // Can add admin
                newUser.roles = [roleIdFor.admin];
                UserAPI.add({users: [newUser]}, _.extend({}, context.superAdmin, {withRelated: 'roles'}))
                    .then(function (response) {
                        checkAddResponse(response);
                        should.exist(response.users[0]._id);
                        response.users[0].roles[0].name.should.equal('Administrator');
                        done();
                    }).catch(done);
            });

            it('Can add an iColleger', function (done) {
                // Can add editor
                newUser.roles = [roleIdFor.icolleger];
                UserAPI.add({users: [newUser]}, _.extend({}, context.superAdmin, {withRelated: 'roles'}))
                    .then(function (response) {
                        checkAddResponse(response);
                        should.exist(response.users[0]._id);
                        response.users[0].roles[0].name.should.equal('iColleger');
                        done();
                    }).catch(done);
            });

            it('Can add with no role set', function (done) {
                // Can add author
                delete newUser.roles;
                UserAPI.add({users: [newUser]}, _.extend({}, context.superAdmin, {withRelated: 'roles'}))
                    .then(function (response) {
                        checkAddResponse(response);
                        should.exist(response.users[0]._id);
                        response.users[0].roles[0].name.should.equal('iColleger');
                        done();
                    }).catch(done);
            });
        });

        describe('Administrator', function () {
            it('CANNOT add a SuperAdministrator', function (done) {
                newUser.roles = [roleIdFor.superAdmin];
                // Admin cannot add owner
                UserAPI.add({users: [newUser]}, _.extend({}, context.admin, {withRelated: 'roles'}))
                    .then(function () {
                        done(new Error('Admin should not be able to add an owner'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });
            it('CANNOT add an Administrator', function (done) {
                // Can add admin
                newUser.roles = [roleIdFor.admin];
                // Admin cannot add owner
                UserAPI.add({users: [newUser]}, _.extend({}, context.admin, {withRelated: 'roles'}))
                    .then(function () {
                        done(new Error('Admin should not be able to add an Admin'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('Can add an iColleger', function (done) {
                // Can add editor
                newUser.roles = [roleIdFor.icolleger];
                UserAPI.add({users: [newUser]}, _.extend({}, context.admin, {withRelated: 'roles'}))
                    .then(function (response) {
                        checkAddResponse(response);
                        should.exist(response.users[0]._id);
                        response.users[0].roles[0].name.should.equal('iColleger');
                        done();
                    }).catch(done);
            });
        });

        describe('iColleger', function () {
            it('CANNOT add a SuperAdministrator', function (done) {
                newUser.roles = [roleIdFor.superAdmin];
                // Editor cannot add owner
                UserAPI.add({users: [newUser]}, _.extend({}, context.icolleger1, {withRelated: 'roles'}))
                    .then(function () {
                        done(new Error('iColleger should not be able to add an owner'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('CANNOT add an iColleger', function (done) {
                newUser.roles = [roleIdFor.icolleger];
                UserAPI.add({users: [newUser]}, _.extend({}, context.icolleger1, {withRelated: 'roles'}))
                    .then(function () {
                        done(new Error('Author should not be able to add an author'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });
        });
    });

    describe('Destroy', function () {
        function checkDestroyResponse(response) {
            should.exist(response);
            should.exist(response.users);
            should.not.exist(response.meta);
            response.users.should.have.length(1);
            testUtils.API.checkResponse(response.users[0], 'user');
            response.users[0].created_at.should.be.a.Date;
        }

        describe('SuperAdministrator', function () {
            it('CANNOT destroy self', function (done) {
                UserAPI.destroy(_.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                    .then(function () {
                        done(new Error('Owner should not be able to delete itself'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('Can destroy Administrator, iColleger', function (done) {
                // Admin
                UserAPI.destroy(_.extend({}, context.superAdmin, {_id: userIdFor.admin}))
                    .then(function (response) {
                        checkDestroyResponse(response);
                        // Editor
                        return UserAPI.destroy(_.extend({}, context.superAdmin, {_id: userIdFor.icolleger1}));
                    }).then(function (response) {
                        checkDestroyResponse(response);

                        done();
                    }).catch(done);
            });
        });

        describe('Administrator', function () {
            it('CANNOT destroy SuperAdministrator', function (done) {
                UserAPI.destroy(_.extend({}, context.admin, {_id: userIdFor.superAdmin}))
                    .then(function () {
                        done(new Error('Administrator should not be able to delete SuperAdministrator'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('Can destroy iColleger', function (done) {
                // iColleger
                UserAPI.destroy(_.extend({}, context.admin, {_id: userIdFor.icolleger1}))
                    .then(function (response) {
                        checkDestroyResponse(response);

                        done();
                    }).catch(done);
            });
        });

        describe('iColleger', function () {
            it('CANNOT destroy SuperAdministrator', function (done) {
                UserAPI.destroy(_.extend({}, context.icolleger1, {_id: userIdFor.superAdmin}))
                    .then(function () {
                        done(new Error('iColleger should not be able to delete SuperAdministrator'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('CANNOT destroy Administrator', function (done) {
                UserAPI.destroy(_.extend({}, context.icolleger1, {_id: userIdFor.admin}))
                    .then(function () {
                        done(new Error('iColleger should not be able to delete Administrator'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('CANNOT destroy other editor', function (done) {
                UserAPI.destroy(_.extend({}, context.icolleger1, {_id: userIdFor.icolleger2}))
                    .then(function () {
                        done(new Error('iColleger should not be able to delete other iColleger'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
            });

            it('Can destroy self', function (done) {
                UserAPI.destroy(_.extend({}, context.icolleger1, {_id: userIdFor.icolleger1}))
                    .then(function (response) {
                        checkDestroyResponse(response);
                        done();
                    }).catch(done);
            });
        });
    });

    describe('Edit and assign role', function () {
        var newName = 'Jo McBlogger';

        function checkEditResponse(response) {
            should.exist(response);
            should.not.exist(response.meta);
            should.exist(response.users);
            response.users.should.have.length(1);
            testUtils.API.checkResponse(response.users[0], 'user');
            response.users[0].name.should.equal(newName);
            response.users[0].updated_at.should.be.a.Date;
        }

        describe('SuperAdministrator', function () {
            it('Can assign Administrator role', function (done) {
                var options = _.extend({}, context.superAdmin, {_id: userIdFor.icolleger1}, {withRelated: 'roles'});
                UserAPI.read(options).then(function (response) {
                    response.users[0]._id.should.equal(userIdFor.icolleger1);
                    response.users[0].roles[0].name.should.equal('iColleger');

                    return UserAPI.edit({
                        users: [
                            {name: newName, roles: [roleIdFor.admin]}
                        ]
                    }, options).then(function (response) {
                        checkEditResponse(response);
                        response.users[0]._id.should.equal(userIdFor.icolleger1);
                        response.users[0].roles[0].name.should.equal('Administrator');

                        done();
                    }).catch(done);
                });
            });

            it('Can assign iColleger role', function (done) {
                var options = _.extend({}, context.superAdmin, {_id: userIdFor.admin}, {withRelated: 'roles'});
                UserAPI.read(options).then(function (response) {
                    response.users[0]._id.should.equal(userIdFor.admin);
                    response.users[0].roles[0].name.should.equal('Administrator');

                    return UserAPI.edit({
                        users: [
                            {name: newName, roles: [roleIdFor.icolleger]}
                        ]
                    }, options).then(function (response) {
                        checkEditResponse(response);
                        response.users[0]._id.should.equal(userIdFor.admin);
                        response.users[0].roles[0].name.should.equal('iColleger');

                        done();
                    }).catch(done);
                });
            });
        });

        describe('Administrator', function () {
            // cannot get a user without role
            it('Can assign iColleger role', function (done) {
                var options = _.extend({}, context.admin, {_id: userIdFor.icolleger1}, {withRelated: 'roles'});
                UserAPI.read(options).then(function (response) {
                    response.users[0]._id.should.equal(userIdFor.icolleger1);
                    response.users[0].roles[0].name.should.equal('iColleger');

                    return UserAPI.edit({
                        users: [
                            {name: newName, roles: [roleIdFor.icolleger]}
                        ]
                    }, options).then(function (response) {
                        checkEditResponse(response);
                        response.users[0]._id.should.equal(userIdFor.icolleger1);
                        response.users[0].roles[0].name.should.equal('iColleger');

                        done();
                    }).catch(done);
                });
            });

            it('CANNOT downgrade SuperAdministrator', function (done) {
                var options = _.extend({}, context.admin, {_id: userIdFor.superAdmin}, {withRelated: 'roles'});
                UserAPI.read(options).then(function (response) {
                    response.users[0]._id.should.equal(userIdFor.superAdmin);
                    response.users[0].roles[0].name.should.equal('SuperAdministrator');

                    return UserAPI.edit({
                        users: [{name: newName, roles: [roleIdFor.icolleger]}]
                    }, options).then(function () {
                        done(new Error('Author should not be able to downgrade SuperAdministrator'));
                    }).catch(function (error) {
                        error.type.should.eql('NoPermissionError');
                        done();
                    });
                });
            });
        });

        describe('iColleger', function () {
            it('CANNOT assign higher role to self', function (done) {
                UserAPI.edit(
                    {users: [{name: newName, roles: [roleIdFor.admin]}]},
                    _.extend({}, context.icolleger1, {_id: userIdFor.icolleger1}, {withRelated: 'roles'})
                ).then(function () {
                    done(new Error('iColleger should not be able to upgrade their role'));
                }, function (error) {
                    error.type.should.eql('NoPermissionError');
                    done();
                }).catch(done);
            });
        });
    });

    //describe('Transfer ownership', function () {
    //    it('Owner can transfer ownership', function (done) {
    //        // transfer ownership to admin user id:2
    //        UserAPI.transferOwnership(
    //            {owner: [{id: userIdFor.admin}]},
    //            context.owner
    //        ).then(function (response) {
    //            should.exist(response);
    //            response.users.should.have.length(2);
    //            testUtils.API.checkResponse(response.users[0], 'user', ['roles']);
    //            testUtils.API.checkResponse(response.users[1], 'user', ['roles']);
    //            response.users[0].roles[0].id.should.equal(1);
    //            response.users[1].roles[0].id.should.equal(4);
    //            done();
    //        }).catch(done);
    //    });
    //
    //    it('Owner CANNOT downgrade own role', function (done) {
    //        // Cannot change own role to admin
    //        UserAPI.transferOwnership(
    //            {owner: [{id: userIdFor.owner}]},
    //            context.owner
    //        ).then(function () {
    //            done(new Error('Owner should not be able to downgrade their role'));
    //        }).catch(function (error) {
    //            error.type.should.eql('ValidationError');
    //            done();
    //        });
    //    });
    //
    //    it('Admin CANNOT transfer ownership', function (done) {
    //        // transfer ownership to user id: 2
    //        UserAPI.transferOwnership(
    //            {owner: [{id: userIdFor.editor}]},
    //            context.admin
    //        ).then(function () {
    //            done(new Error('Admin is not denied transferring ownership.'));
    //        }).catch(function (error) {
    //            error.type.should.eql('NoPermissionError');
    //            done();
    //        });
    //    });
    //
    //    it('Editor CANNOT transfer ownership', function (done) {
    //        // transfer ownership to user id: 2
    //        UserAPI.transferOwnership(
    //            {owner: [{id: userIdFor.admin}]},
    //            context.editor
    //        ).then(function () {
    //            done(new Error('Admin is not denied transferring ownership.'));
    //        }).catch(function (error) {
    //            error.type.should.eql('NoPermissionError');
    //            done();
    //        });
    //    });
    //
    //    it('Author CANNOT transfer ownership', function (done) {
    //        // transfer ownership to user id: 2
    //        UserAPI.transferOwnership(
    //            {owner: [{id: userIdFor.admin}]},
    //            context.author
    //        ).then(function () {
    //            done(new Error('Admin is not denied transferring ownership.'));
    //        }).catch(function (error) {
    //            error.type.should.eql('NoPermissionError');
    //            done();
    //        });
    //    });
    //});

    describe('Change Password', function () {
        it('SuperAdministrator can change own password', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.superAdmin,
                    oldPassword: 'Sl1m3rson',
                    newPassword: 'newSl1m3rson',
                    ne2Password: 'newSl1m3rson'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function (response) {
                    response.password[0].message.should.eql('Password changed successfully.');
                    done();
                }).catch(done);
        });

        it('SuperAdministrator can\'t change password with wrong oldPassword', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.superAdmin,
                    oldPassword: 'wrong',
                    newPassword: 'Sl1m3rson',
                    ne2Password: 'Sl1m3rson'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function () {
                    done(new Error('Password change is not denied.'));
                }).catch(function (error) {
                    error.type.should.eql('ValidationError');
                    done();
                });
        });

        it('SuperAdministrator can\'t change password without matching passwords', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.superAdmin,
                    oldPassword: 'Sl1m3rson',
                    newPassword: 'Sl1m3rson1',
                    ne2Password: 'Sl1m3rson2'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function () {
                    done(new Error('Password change is not denied.'));
                }).catch(function (error) {
                    error.type.should.eql('ValidationError');
                    done();
                });
        });

        it('SuperAdministrator can\'t change Administrator password without matching passwords', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.admin,
                    newPassword: 'Sl1m3rson1',
                    ne2Password: 'Sl1m3rson2'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function () {
                    done(new Error('Password change is not denied.'));
                }).catch(function (error) {
                    error.type.should.eql('ValidationError');
                    done();
                });
        });

        it('SuperAdministrator can\'t change Administrator password without short passwords', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.admin,
                    newPassword: 'Sl',
                    ne2Password: 'Sl'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function () {
                    done(new Error('Password change is not denied.'));
                }).catch(function (error) {
                    error.type.should.eql('ValidationError');
                    done();
                });
        });

        it('SuperAdministrator can change password for Administrator', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.admin,
                    newPassword: 'newSl1m3rson',
                    ne2Password: 'newSl1m3rson'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.superAdmin, {_id: userIdFor.superAdmin}))
                .then(function (response) {
                    response.password[0].message.should.eql('Password changed successfully.');
                    done();
                }).catch(done);
        });

        it('Administrator can change password for iColleger', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.icolleger1,
                    newPassword: 'newSl1m3rson',
                    ne2Password: 'newSl1m3rson'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.admin, {_id: userIdFor.admin}))
                .then(function (response) {
                    response.password[0].message.should.eql('Password changed successfully.');
                    done();
                }).catch(done);
        });

        it('iColleger can\'t change password for admin', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.admin,
                    newPassword: 'newSl1m3rson',
                    ne2Password: 'newSl1m3rson'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.icolleger1, {_id: userIdFor.icolleger1}))
                .then(function () {
                    done(new Error('Password change is not denied.'));
                }).catch(function (error) {
                    error.type.should.eql('NoPermissionError');
                    done();
                });
        });

        it('iColleger can\'t change password for other iColleger', function (done) {
            var payload = {
                password: [{
                    user_id: userIdFor.icolleger1,
                    newPassword: 'newSl1m3rson',
                    ne2Password: 'newSl1m3rson'
                }]
            };
            UserAPI.changePassword(payload, _.extend({}, context.icolleger2, {_id: userIdFor.icolleger2}))
                .then(function () {
                    done(new Error('Password change is not denied.'));
                }).catch(function (error) {
                    error.type.should.eql('NoPermissionError');
                    done();
                });
        });
    });
});
