/*global describe, it */
/*jshint expr:true*/
// # Module tests
// This tests using icollege as an npm module
var should     = require('should'),

    icollege      = require('../../../../core');

describe('Module', function () {
    describe('Setup', function () {
        it('should resolve with a icollege-server instance', function (done) {
            icollege().then(function (icollegeServer) {
                should.exist(icollegeServer);

                done();
            }).catch(function (e) {
                done(e);
            });
        });

        it('should expose an express instance', function (done) {
            icollege().then(function (icollegeServer) {
                should.exist(icollegeServer);
                should.exist(icollegeServer.rootApp);

                done();
            }).catch(function (e) {
                done(e);
            });
        });

        it('should expose configuration values', function (done) {
            icollege().then(function (icollegeServer) {
                should.exist(icollegeServer);
                should.exist(icollegeServer.config);
                should.exist(icollegeServer.config.server);
                should.exist(icollegeServer.config.paths);
                should.exist(icollegeServer.config.paths.subdir);
                should.equal(icollegeServer.config.paths.subdir, '');

                done();
            }).catch(function (e) {
                done(e);
            });
        });

        it('should have start/stop/restart functions', function (done) {
            icollege().then(function (icollegeServer) {
                should.exist(icollegeServer);
                icollegeServer.start.should.be.a.Function;
                icollegeServer.restart.should.be.a.Function;
                icollegeServer.stop.should.be.a.Function;

                done();
            }).catch(function (e) {
                done(e);
            });
        });
    });
});