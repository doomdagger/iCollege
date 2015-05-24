/*globals describe, before, beforeEach, afterEach, it */
/*jshint expr:true*/
var testUtils       = require('../../utils'),
    should          = require('should'),
    config          = require('../../../server/config'),
    mailer          = require('../../../server/mail'),

    // Stuff we are testing
    MailAPI         = require('../../../server/api/mail'),
    mailDataNoDomain = {
        mail: [{
            message: {
                to: 'joe@doesntexistexample091283zalgo.com',
                subject: 'testemail',
                html: '<p>This</p>'
            },
            options: {}
        }]
    },
    mailDataNoServer = {
        mail: [{
            message: {
                to: 'joe@example.com',
                subject: 'testemail',
                html: '<p>This</p>'
            },
            options: {}
        }]
    },
    mailDataIncomplete = {
        mail: [{
            message: {
                subject: 'testemail',
                html: '<p>This</p>'
            },
            options: {}
        }]
    };

describe('Mail API', function () {
    before(testUtils.wait);
    before(testUtils.teardown);
    afterEach(testUtils.teardown);
    beforeEach(testUtils.DataGenerator.resetCounter);
    beforeEach(testUtils.setup('perms:mail', 'perms:init', 'owner'));

    should.exist(MailAPI);

    describe('Nothing configured', function () {
        it('return no email configured', function (done) {
            MailAPI.send(mailDataNoServer, testUtils.context.internal).then(function (response) {
                /*jshint unused:false */
                done();
            }).catch(function (error) {
                error.message.should.eql('Email Error: No e-mail transport configured.');
                error.type.should.eql('EmailError');
                done();
            }).catch(done);
        });

        it('return no email configured even when sending incomplete data', function (done) {
            MailAPI.send(mailDataIncomplete, testUtils.context.internal).then(function (response) {
                /*jshint unused:false */
                done();
            }).catch(function (error) {
                error.message.should.eql('Email Error: No e-mail transport configured.');
                error.type.should.eql('EmailError');
                done();
            }).catch(done);
        });
    });

    describe('Mail API Direct', function () {
        before(function (done) {
            config.set({mail: {}});

            mailer.init().then(function () {
                done();
            });
        });

        // This test doesn't work properly - it times out locally
        it('return correct failure message for domain doesn\'t exist', function (done) {
            mailer.transport.transportType.should.eql('DIRECT');
            return MailAPI.send(mailDataNoDomain, testUtils.context.internal).then(function () {
                done(new Error('Error message not shown.'));
            }, function (error) {
                error.message.should.startWith('Error: Sending failed');
                error.type.should.eql('EmailError');
                done();
            }).catch(done);
        });

        // This test doesn't work properly - it times out locally
        it('return correct failure message for no mail server at this address', function (done) {
            mailer.transport.transportType.should.eql('DIRECT');
            MailAPI.send(mailDataNoServer, testUtils.context.internal).then(function () {
                done(new Error('Error message not shown.'));
            }, function (error) {
                error.message.should.eql('Error: Sending failed');
                error.type.should.eql('EmailError');
                done();
            }).catch(done);
        });

        it('return correct failure message for incomplete data', function (done) {
            mailer.transport.transportType.should.eql('DIRECT');

            MailAPI.send(mailDataIncomplete, testUtils.context.internal).then(function () {
                done(new Error('Error message not shown.'));
            }, function (error) {
                error.message.should.eql('Email Error: Incomplete message data.');
                error.type.should.eql('EmailError');
                done();
            }).catch(done);
        });
    });

    describe('Mail API Yahoo', function () {
        before(function (done) {
            config.set({
                mail: {
                    transport: 'SMTP',
                    options: {
                        service: 'Yahoo',
                        auth: {
                            user: 'icollege.platform@yahoo.com', // Yahoo username
                            pass: 'mroftalpegelloci'            // Yahoo password
                        }
                    },
                    mailfrom: 'icollege.platform@yahoo.com', // mail from address, Yahoo service demand this value to be same with auth.user
                    mailto: 'icollege.platform@yahoo.com'  // test mail address, only for development
                }
            });

            mailer.init().then(function () {
                done();
            });
        });

        // can cause some service block the mail account, test it locally
        it.skip('returns a success', function (done) {
            mailer.transport.transportType.should.eql('SMTP');

            MailAPI.sendTest(testUtils.context.internal).then(function () {
                done();
            }, function (error) {
                done(error);
            }).catch(done);
        });

    });
});
