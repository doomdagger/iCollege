/*globals describe, afterEach, it*/
/*jshint expr:true*/
var should          = require('should'),
    Promise         = require('bluebird'),

// Stuff we are testing
    mailer          = require('../../server/mail'),
    config          = require('../../server/config'),

    SMTP;

// Mock SMTP config
SMTP = {
    transport: 'SMTP',
    options: {
        service: 'Gmail',
        auth: {
            user: 'nil',
            pass: '123'
        }
    }
};

describe('Mail', function () {
    afterEach(function () {
        config.set({mail: null});
    });

    it('should attach mail provider to ghost instance', function () {
        should.exist(mailer);
        mailer.should.have.property('init');
        mailer.should.have.property('transport');
        mailer.should.have.property('send').and.be.a.function;
    });

    it('should setup SMTP transport on initialization', function (done) {
        config.set({mail: SMTP});
        mailer.init().then(function () {
            mailer.should.have.property('transport');
            mailer.transport.transportType.should.eql('SMTP');
            mailer.transport.sendMail.should.be.a.function;
            done();
        }).catch(done);
    });

    it('should fallback to direct if config is empty', function (done) {
        config.set({mail: {}});
        mailer.init().then(function () {
            mailer.should.have.property('transport');
            mailer.transport.transportType.should.eql('DIRECT');
            done();
        }).catch(done);
    });

    it('should fail to send messages when given insufficient data', function (done) {
        Promise.settle([
            mailer.send(),
            mailer.send({}),
            mailer.send({subject: '123'}),
            mailer.send({subject: '', html: '123'})
        ]).then(function (descriptors) {
            descriptors.forEach(function (d) {
                d.isRejected().should.be.true;
                d.reason().should.be.an.instanceOf(Error);
                d.reason().message.should.eql('Email Error: Incomplete message data.');
            });
            done();
        }).catch(done);
    });

    it('should use from address as configured in config.js', function () {
        config.set({
            mail: {
                mailfrom: 'Blog Title <static@example.com>'
            }
        });
        mailer.from().should.equal('Blog Title <static@example.com>');
    });

    it('should fall back to [blog.title] <icollege@[blog.url]> as from address', function () {
        // with no title given
        config.set({url: 'http://default.com/', mail: {mailfrom: null}, theme: {}});
        mailer.from().should.equal('iCollege at default.com <icollege@default.com>');

        // Standard domain
        config.set({url: 'http://default.com', mail: {mailfrom: null}, theme: {title: 'Test'}});
        mailer.from().should.equal('Test <icollege@default.com>');

        // Trailing slash
        config.set({url: 'http://default.com/', mail: {mailfrom: null}, theme: {title: 'Test'}});
        mailer.from().should.equal('Test <icollege@default.com>');

        // Strip Port
        config.set({url: 'http://default.com:2368/', mail: {mailfrom: null}, theme: {title: 'Test'}});
        mailer.from().should.equal('Test <icollege@default.com>');
    });

    it('should use mail.mailfrom if both mailfrom and fromaddress are present', function () {
        // Standard domain
        config.set({mail: {mailfrom: 'bar <from@default.com>', fromaddress: 'Qux <fa@default.com>'}});
        mailer.from().should.equal('bar <from@default.com>');
    });

    it('should attach blog title if mailfrom or fromaddress are only email addresses', function () {
        // from and fromaddress are both set
        config.set({mail: {mailfrom: 'from@default.com', fromaddress: 'fa@default.com'}, theme: {title: 'Test'}});
        mailer.from().should.equal('Test <from@default.com>');

        // only from set
        config.set({mail: {mailfrom: 'from@default.com', fromaddress: null}, theme: {title: 'Test'}});
        mailer.from().should.equal('Test <from@default.com>');

        // only fromaddress set
        config.set({mail: {mailfrom: null, fromaddress: 'fa@default.com'}, theme: {title: 'Test'}});
        mailer.from().should.equal('Test <fa@default.com>');
    });

    it('should ignore theme title if from address is Title <email@address.com> format', function () {
        // from and fromaddress are both set
        config.set({mail: {mailfrom: 'R2D2 <from@default.com>', fromaddress: 'C3PO <fa@default.com>'}, theme: {title: 'Test'}});
        mailer.from().should.equal('R2D2 <from@default.com>');

        // only from set
        config.set({mail: {mailfrom: 'R2D2 <from@default.com>', fromaddress: null}, theme: {title: 'Test'}});
        mailer.from().should.equal('R2D2 <from@default.com>');

        // only fromaddress set
        config.set({mail: {mailfrom: null, fromaddress: 'C3PO <fa@default.com>'}, theme: {title: 'Test'}});
        mailer.from().should.equal('C3PO <fa@default.com>');
    });
});
