/*globals describe, before, beforeEach, afterEach, it */
/*jshint expr:true*/
var testUtils   = require('../../utils'),
    should      = require('should'),

    SlugAPI     = require('../../../server/api/slugs');

describe('Slug API', function () {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);

    beforeEach(testUtils.DataGenerator.resetCounter);
    beforeEach(testUtils.setup('users:roles', 'perms:slug', 'perms:init'));

    should.exist(SlugAPI);

    it('can generate post slug', function (done) {
        SlugAPI.generate({context: {user: '000000000000000000000000'}, type: 'post', name: 'A fancy Title'})
        .then(function (results) {
            should.exist(results);
            testUtils.API.checkResponse(results, 'slugs');
            results.slugs.length.should.be.above(0);
            testUtils.API.checkResponse(results.slugs[0], 'slug');
            results.slugs[0].slug.should.equal('a-fancy-title');
            done();
        }).catch(done);
    });

    it('can generate group slug', function (done) {
        SlugAPI.generate({context: {user: '000000000000000000000000'}, type: 'group', name: 'A fancy group'})
        .then(function (results) {
            should.exist(results);
            testUtils.API.checkResponse(results, 'slugs');
            results.slugs.length.should.be.above(0);
            testUtils.API.checkResponse(results.slugs[0], 'slug');
            results.slugs[0].slug.should.equal('a-fancy-group');
            done();
        }).catch(done);
    });

    it('can generate user slug', function (done) {
        SlugAPI.generate({context: {user: '000000000000000000000000'}, type: 'user', name: 'user name'})
        .then(function (results) {
            should.exist(results);
            testUtils.API.checkResponse(results, 'slugs');
            results.slugs.length.should.be.above(0);
            testUtils.API.checkResponse(results.slugs[0], 'slug');
            results.slugs[0].slug.should.equal('user-name');
            done();
        }).catch(done);
    });

    it('can generate circle slug', function (done) {
        SlugAPI.generate({context: {user: '000000000000000000000000'}, type: 'circle', name: 'circle name'})
        .then(function (results) {
            should.exist(results);
            testUtils.API.checkResponse(results, 'slugs');
            results.slugs.length.should.be.above(0);
            testUtils.API.checkResponse(results.slugs[0], 'slug');
            results.slugs[0].slug.should.equal('circle-name');
            done();
        }).catch(done);
    });

    it('rejects unknown types', function (done) {
        SlugAPI.generate({context: {user: '000000000000000000000000'}, type: 'unknown type', name: 'A fancy Title'})
        .then(function () {
            done(new Error('Generate a slug for an unknown type is not rejected.'));
        }).catch(function (error) {
            error.type.should.equal('BadRequestError');
            done();
        }).catch(done);
    });
});
