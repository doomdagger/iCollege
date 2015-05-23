/*globals describe, before, beforeEach, it*/
/*jshint expr:true*/
var should          = require('should'),

    testUtil        = require('../utils'),
    requireTree   = require('../../../core/server/require-tree');

describe('Require Tree', function () {

    var normal,
        malformed,
        incomplete,
        nonexist,
        messages;

    before(function () {
        normal = testUtil.fixtures.getPackageFilePath('package-normal');
        malformed = testUtil.fixtures.getPackageFilePath('package-malformed');
        nonexist = testUtil.fixtures.getPackageFilePath('package-nonexist');
        incomplete = testUtil.fixtures.getPackageFilePath('package-incomplete');
    });

    beforeEach(function () {
        messages = {
            errors: [],
            warns: []
        };
    });

    describe('Parse Package.json', function () {
        it('should be an error for wrong file path', function (done) {
            requireTree.parsePackageJson(nonexist, messages).then(function (result) {
                result.should.equal(false);
                messages.errors[0].message.should.equal('Could not read package.json file');

                done();
            });
        });

        it('should be an error for malformed file', function (done) {
            requireTree.parsePackageJson(malformed, messages).then(function (result) {
                result.should.equal(false);
                messages.errors[0].message.should.equal('The package.json file is malformed');

                done();
            });
        });

        it('should be an error for incomplete file', function (done) {
            requireTree.parsePackageJson(incomplete, messages).then(function (result) {
                result.should.equal(false);
                messages.errors[0].message.should.equal('"name" or "version" is missing from theme package.json file.');

                done();
            });
        });

        it('should be correct for normal file', function (done) {
            requireTree.parsePackageJson(normal, messages).then(function (result) {
                should(result).be.an.instanceof(Object);
                messages.errors.length.should.equal(0);

                done();
            });
        });
    });
});
