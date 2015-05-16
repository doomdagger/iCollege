/*globals describe, before, beforeEach, afterEach, it */
/*jshint expr:true*/
var testUtils   = require('../../utils'),
    should      = require('should'),
    _           = require('lodash'),

    // Stuff we are testing
    RoleAPI     = require('../../../server/api/roles'),
    context     = testUtils.context;

describe('Roles API', function () {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    beforeEach(testUtils.DataGenerator.resetCounter);
    beforeEach(testUtils.setup('users:roles', 'perms:role', 'perms:init'));

    describe('Browse', function () {
        function checkBrowseResponse(response) {
            should.exist(response);
            testUtils.API.checkResponse(response, 'roles');
            should.exist(response.roles);
            response.roles.should.have.length(3);
            testUtils.API.checkResponse(response.roles[0], 'role');
            testUtils.API.checkResponse(response.roles[1], 'role');
            testUtils.API.checkResponse(response.roles[2], 'role');
        }

        it('SuperAdministrator can browse', function (done) {
            RoleAPI.browse(context.superAdmin).then(function (response) {
                checkBrowseResponse(response);
                done();
            }).catch(done);
        });

        it('Administrator can browse', function (done) {
            RoleAPI.browse(context.admin).then(function (response) {
                checkBrowseResponse(response);
                done();
            }).catch(done);
        });

        it('iColleger can browse', function (done) {
            RoleAPI.browse(context.icolleger1).then(function (response) {
                checkBrowseResponse(response);
                done();
            }).catch(done);
        });

        it('No-auth CANNOT browse', function (done) {
            RoleAPI.browse().then(function () {
                done(new Error('Browse roles is not denied without authentication.'));
            }, function () {
                done();
            }).catch(done);
        });
    });

    describe('Browse permissions=assign', function () {
        function checkBrowseResponse(response) {
            should.exist(response);
            should.exist(response.roles);
            testUtils.API.checkResponse(response, 'roles');
            response.roles.should.have.length(2);
            testUtils.API.checkResponse(response.roles[0], 'role');
            testUtils.API.checkResponse(response.roles[1], 'role');
            response.roles[0].name.should.equal('Administrator');
            response.roles[1].name.should.equal('iColleger');
        }

        it('SuperAdministrator can assign all', function (done) {
            RoleAPI.browse(_.extend({}, context.superAdmin, {permissions: 'assign'})).then(function (response) {
                checkBrowseResponse(response);
                done();
            }).catch(done);
        });

        it('Administrator can assign iColleger', function (done) {
            RoleAPI.browse(_.extend({}, context.admin, {permissions: 'assign'})).then(function (response) {
                should.exist(response);
                should.exist(response.roles);
                testUtils.API.checkResponse(response, 'roles');
                response.roles.should.have.length(1);
                testUtils.API.checkResponse(response.roles[0], 'role');
                response.roles[0].name.should.equal('iColleger');
                done();
            }).catch(done);
        });

        it('iColleger CANNOT assign any', function (done) {
            RoleAPI.browse(_.extend({}, context.icolleger1, {permissions: 'assign'})).then(function (response) {
                should.exist(response);
                should.exist(response.roles);
                testUtils.API.checkResponse(response, 'roles');
                response.roles.should.have.length(0);
                done();
            }).catch(done);
        });

        it('No-auth CANNOT browse', function (done) {
            RoleAPI.browse({permissions: 'assign'}).then(function () {
                done(new Error('Browse roles is not denied without authentication.'));
            }, function () {
                done();
            }).catch(done);
        });
    });
});
