/*globals describe, beforeEach, afterEach, it*/
/*jshint expr:true*/
var assert          = require('assert'),
    should          = require('should'),
    sinon           = require('sinon'),
    middleware      = require('../../server/middleware').middleware;

describe('Middleware', function () {

    //     beforeEach(function () {
    //         req = {
    //             session: {}
    //         };

    //         res = {
    //             redirect: sinon.spy()
    //         };
    //     });

    //     it('should redirect to dashboard', function () {
    //         req.session.user = {};

    //         middleware.redirectToDashboard(req, res, null);
    //         assert(res.redirect.calledWithMatch('/ghost/'));
    //     });

    //     it('should call next if no user in session', function (done) {
    //         middleware.redirectToDashboard(req, res, function (a) {
    //             should.not.exist(a);
    //             assert(res.redirect.calledOnce.should.be.false);
    //             done();
    //         });
    //     });
    // });

    describe('cacheControl', function () {
        var res;

        beforeEach(function () {
            res = {
                set: sinon.spy()
            };
        });

        it('correctly sets the public profile headers', function (done) {
            middleware.cacheControl('public')(null, res, function (a) {
                should.not.exist(a);
                res.set.calledOnce.should.be.true;
                res.set.calledWith({'Cache-Control': 'public, max-age=0'});
                done();
            });
        });

        it('correctly sets the private profile headers', function (done) {
            middleware.cacheControl('private')(null, res, function (a) {
                should.not.exist(a);
                res.set.calledOnce.should.be.true;
                res.set.calledWith({
                    'Cache-Control':
                        'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
                });
                done();
            });
        });

        it('will not set headers without a profile', function (done) {
            middleware.cacheControl()(null, res, function (a) {
                should.not.exist(a);
                res.set.called.should.be.false;
                done();
            });
        });
    });

    describe('whenEnabled', function () {
        var cbFn, app;

        beforeEach(function () {
            cbFn = sinon.spy();
            app = {
                enabled: function (setting) {
                    if (setting === 'enabled') {
                        return true;
                    } else {
                        return false;
                    }
                }
            };
            middleware.cacheApp(app);
        });

        it('should call function if setting is enabled', function (done) {
            var req = 1, res = 2, next = 3;

            middleware.whenEnabled('enabled', function (a, b, c) {
                assert.equal(a, 1);
                assert.equal(b, 2);
                assert.equal(c, 3);
                done();
            })(req, res, next);
        });

        it('should call next() if setting is disabled', function (done) {
            middleware.whenEnabled('rando', cbFn)(null, null, function (a) {
                should.not.exist(a);
                cbFn.calledOnce.should.be.false;
                done();
            });
        });
    });

});
