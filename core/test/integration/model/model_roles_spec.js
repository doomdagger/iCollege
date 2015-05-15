/*globals describe, it, before, beforeEach, afterEach */
/*jshint expr:true*/
var testUtils   = require('../../utils'),
    should      = require('should'),

    // Stuff we are testing
    RoleModel   = require('../../../server/models/role').Role,
    context     = testUtils.context.admin;

describe('Role Model', function () {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);

    beforeEach(testUtils.DataGenerator.resetCounter);
    beforeEach(testUtils.setup('role'));

    before(function () {
        should.exist(RoleModel);
    });

    it('can findAll', function (done) {
        RoleModel.findAll().then(function (foundRoles) {
            should.exist(foundRoles);

            foundRoles.length.should.be.above(0);

            done();
        }).catch(done);
    });

    it('can findOne', function (done) {
        RoleModel.findSingle({_id: '000000000000000000000000'}).then(function (foundRole) {
            should.exist(foundRole);
            foundRole.get('created_at').should.be.an.instanceof(Date);

            done();
        }).catch(done);
    });

    it('can edit', function (done) {
        RoleModel.findSingle({_id: '000000000000000000000000'}).then(function (foundRole) {
            should.exist(foundRole);

            return foundRole.set({name: 'updated'}).__save(context);
        }).then(function () {
            return RoleModel.findSingle({_id: '000000000000000000000000'});
        }).then(function (updatedRole) {
            should.exist(updatedRole);

            updatedRole.get('name').should.equal('updated');

            done();
        }).catch(done);
    });

    it('can add', function (done) {
        var newRole = {
            name: 'test1',
            description: 'test1 description'
        };

        RoleModel.add(newRole, context).then(function (createdRole) {
            should.exist(createdRole);

            createdRole.name.should.equal(newRole.name);
            createdRole.description.should.equal(newRole.description);

            done();
        }).catch(done);
    });

    it('can destroy', function (done) {
        var firstRole = {_id: '000000000000000000000000'};

        RoleModel.findSingle(firstRole).then(function (foundRole) {
            should.exist(foundRole);
            foundRole.id.should.equal(firstRole._id);

            return RoleModel.destroy(firstRole);
        }).then(function (response) {
            response.should.eql({ ok: 1, n: 1 });
            return RoleModel.findSingle(firstRole);
        }).then(function (newResults) {
            should.equal(newResults, null);

            done();
        }).catch(done);
    });
});
