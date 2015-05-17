/*globals describe, before, beforeEach, afterEach, it */
/*jshint expr:true*/
var testUtils = require('../../utils'),
    should    = require('should'),

    // Stuff we are testing
    dbAPI          = require('../../../server/api/db'),
    PostModel      = require('../../../server/models/post').Post;

describe('DB API', function () {
    // Keep the DB clean
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    beforeEach(testUtils.setup('users:roles', 'posts', 'perms:db', 'perms:init', 'settings'));

    should.exist(dbAPI);

    it('export content (superAdministrator)', function (done) {
        return dbAPI.exportContent(testUtils.context.superAdmin).then(function (result) {
            should.exist(result.db);
            result.db.should.be.instanceof(Array);
            result.db.should.not.be.empty;
            result.db[0].data.permissions.length.should.equal(3);
            done();
        }).catch(done);
    });

    it.skip('delete all content (superAdministrator)', function (done) {
        return dbAPI.deleteAllContent(testUtils.context.superAdmin).then(function (result) {
            should.exist(result.db);
            result.db.should.be.instanceof(Array);
            result.db.should.be.empty;
        }).then(function () {
            return PostModel.findAll(testUtils.context.superAdmin).then(function (results) {
                should.exist(results);
                results.length.should.equal(0);
                done();
            });
        }).catch(done);
    });

    it.skip('import content (superAdministrator)', function (done) {
        var ops = {
            context : testUtils.context.superAdmin,
            importfile : {
                type : 'application/json',
                path : testUtils.fixtures.getExportFixturePath('export-000'),
                name : 'export-000.json'
            }
        };

       return dbAPI.importContent(ops).then(function (result) {
            should.exist(result.db);
            result.db.should.be.instanceof(Array);
            result.db.should.be.empty;
            return PostModel.findAll(ops.context);
        }).then(function (results) {
            results.length.should.eql(3, 'Wrong post result get!');
            done();
        }).catch(done);
    });

    it('delete all content is denied (administrator & iColleger)', function (done) {
        return dbAPI.deleteAllContent(testUtils.context.admin).then(function () {
            done(new Error('Delete all content is not denied for administrator.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            return dbAPI.deleteAllContent(testUtils.context.icolleger1);
        }).then(function () {
            done(new Error('Delete all content is not denied for icolleger.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            return dbAPI.deleteAllContent();
        }).then(function () {
            done(new Error('Delete all content is not denied without authentication.'));
        }).catch(function (error) {
            error.type.should.eql('NoPermissionError');
            done();
        }).catch(done);
    });

    it('export content is denied (administrator & iColleger)', function (done) {
        return dbAPI.exportContent(testUtils.context.admin).then(function () {
            done(new Error('Export content is not denied for administrator.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            return dbAPI.exportContent(testUtils.context.icolleger1);
        }).then(function () {
            done(new Error('Export content is not denied for icolleger.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            return dbAPI.exportContent();
        }).then(function () {
            done(new Error('Export content is not denied without authentication.'));
        }).catch(function (error) {
            error.type.should.eql('NoPermissionError');
            done();
        }).catch(done);
    });

    it('import content is denied with because there is not including file', function (done) {
        return dbAPI.importContent().then(function () {
            done(new Error('Import content is not denied without authentication.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            error.message.should.eql('Please select a file to import.');
            done();
        }).catch(done);
    });

    it('import content is denied with invalid file', function (done) {
        var ops = {
            importfile : {
                type : 'markdown',
                path : 'test/',
                name : 'export-000.json'
            }
        };
        return dbAPI.importContent(ops).then(function () {
            done(new Error('Import content is not denied without authentication.'));
        }, function (error) {
            error.type.should.eql('UnsupportedMediaTypeError');
            error.message.should.eql('Unsupported file. Please try any of the following formats: .jpg, .jpeg, .gif, .png, .svg, .svgz, .json, .zip');
            done();
        }).catch(done);
    });

    it('import content is denied (administrator & iColleger)', function (done) {

        var ops = {
            context : testUtils.context.admin,
            importfile : {
                type : 'application/json',
                path : 'test/',
                name : 'export-000.json'
            }
        };

        return dbAPI.importContent(ops).then(function () {
            done(new Error('import content is not denied for administrator.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            error.message.should.eql('You do not have permission to import data (no rights).');
            ops.context = testUtils.context.icolleger1;
            return dbAPI.importContent(ops);
        }).then(function () {
            done(new Error('import content is not denied for icolleger.'));
        }, function (error) {
            error.type.should.eql('NoPermissionError');
            error.message.should.eql('You do not have permission to import data (no rights).');
            done();
        }).catch(done);
    });

});
