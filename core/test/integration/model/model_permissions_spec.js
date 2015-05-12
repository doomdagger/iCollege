/*globals describe, it, before, beforeEach, afterEach */
/*jshint expr:true*/
var testUtils       = require('../../utils'),
    should          = require('should'),

    // Stuff we are testing
    PermissionModel = require('../../../server/models/permission').Permission,
    context         = testUtils.context.superAdmin;

describe('Permission Model', function () {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    beforeEach(testUtils.DataGenerator.resetCounter);
    beforeEach(testUtils.setup('permission'));

    before(function () {
        should.exist(PermissionModel);
    });

    it('can findAll', function (done) {
        PermissionModel.findAll().then(function (foundPermissions) {
            should.exist(foundPermissions);
            foundPermissions.length.should.be.above(0);

            done();
        }).catch(done);
    });

    it('can findOne', function (done) {
        PermissionModel.findOneAsync({_id: '000000000000000000000000'}).then(function (foundPermission) {
            should.exist(foundPermission);
            foundPermission.get('created_at').should.be.an.instanceof(Date);

            done();
        }).catch(done);
    });

    it('can edit', function (done) {
        PermissionModel.findOneAsync({_id: '000000000000000000000000'}).then(function (foundPermission) {
            should.exist(foundPermission);
            return foundPermission.set({name: 'updated'}).saveAsync(context);
        }).then(function () {
            return PermissionModel.findOneAsync({_id: '000000000000000000000000'});
        }).then(function (updatedPermission) {
            should.exist(updatedPermission);

            updatedPermission.get('name').should.equal('updated');

            done();
        }).catch(done);
    });

    it('can add', function (done) {
        var newPerm = {
            name: 'testperm1',
            object_type: 'test',
            action_type: 'test'
        };

        // 返回的是数组~~~
        PermissionModel.add(newPerm, context).then(function (createdPerms) {
            should.exist(createdPerms[0]);
            createdPerms[0].name.should.equal(newPerm.name);

            done();
        }).catch(done);
    });

    it('can destroy', function (done) {
        var firstPermission = {_id: '000000000000000000000000'};

        PermissionModel.findOneAsync(firstPermission).then(function (foundPermission) {
            should.exist(foundPermission);
            foundPermission.id.should.equal(firstPermission._id);

            return PermissionModel.destroy({id: foundPermission.id});
        }).then(function (response) {
            response.toJSON().should.eql({ ok: 1, n: 1 });
            return PermissionModel.findOneAsync(firstPermission);
        }).then(function (newResults) {
            should.equal(newResults, null);

            done();
        }).catch(done);
    });

//        it('can add user to role', function (done) {
//            var existingUserRoles;
//
//            Models.User.findOne({id: 1}, { withRelated: ['roles'] }).then(function (foundUser) {
//                var testRole = new Models.Role({
//                    name: 'testrole1',
//                    description: 'testrole1 description'
//                });
//
//                should.exist(foundUser);
//
//                should.exist(foundUser.roles());
//
//                existingUserRoles = foundUser.related('roles').length;
//
//                return testRole.save(null, context).then(function () {
//                    return foundUser.roles().attach(testRole);
//                });
//            }).then(function () {
//                return Models.User.findOne({id: 1}, { withRelated: ['roles'] });
//            }).then(function (updatedUser) {
//                should.exist(updatedUser);
//
//                updatedUser.related('roles').length.should.equal(existingUserRoles + 1);
//
//                done();
//            }).catch(done);
//        });
//
//        it('can add user permissions', function (done) {
//            Models.User.findOne({id: 1}, { withRelated: ['permissions']}).then(function (testUser) {
//                var testPermission = new Models.Permission({
//                    name: 'test edit posts',
//                    action_type: 'edit',
//                    object_type: 'post'
//                });
//
//                testUser.related('permissions').length.should.equal(0);
//
//                return testPermission.save(null, context).then(function () {
//                    return testUser.permissions().attach(testPermission);
//                });
//            }).then(function () {
//                return Models.User.findOne({id: 1}, { include: ['permissions']});
//            }).then(function (updatedUser) {
//                should.exist(updatedUser);
//
//                updatedUser.related('permissions').length.should.equal(1);
//
//                done();
//            }).catch(done);
//        });
//
//        it('can add role permissions', function (done) {
//            var testRole = new Models.Role({
//                name: 'test2',
//                description: 'test2 description'
//            });
//
//            testRole.save(null, context)
//                .then(function () {
//                    return testRole.load('permissions');
//                })
//                .then(function () {
//                    var rolePermission = new Models.Permission({
//                        name: 'test edit posts',
//                        action_type: 'edit',
//                        object_type: 'post'
//                    });
//
//                    testRole.related('permissions').length.should.equal(0);
//
//                    return rolePermission.save(null, context).then(function () {
//                        return testRole.permissions().attach(rolePermission);
//                    });
//                })
//                .then(function () {
//                    return Models.Role.findOne({id: testRole.id}, { withRelated: ['permissions']});
//                })
//                .then(function (updatedRole) {
//                    should.exist(updatedRole);
//
//                    updatedRole.related('permissions').length.should.equal(1);
//
//                    done();
//                }).catch(done);
//        });
});
