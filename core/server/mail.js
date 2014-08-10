// # iCollege Mailer

var cp         = require('child_process'),
    _          = require('lodash'),
    when       = require('when'),
    nodefn     = require('when/node'),
    nodemailer = require('nodemailer'),
    config     = require('./config');

function ICollegeMailer(opts) {
    opts = opts || {};
    this.transport = opts.transport || null;
}

// ## E-mail transport setup
// *This promise should always resolve to avoid halting ICollege::init*.
ICollegeMailer.prototype.init = function () {
    var self = this;
    self.state = {};
    if (config().mail && config().mail.transport) {
        this.createTransport();
        return when.resolve();
    }

    // Attempt to detect and fallback to `sendmail`
    return this.detectSendmail().then(function (binpath) {
        self.transport = nodemailer.createTransport('sendmail', {
            path: binpath
        });
        self.state.usingSendmail = true;
    }, function () {
        self.state.emailDisabled = true;
        self.transport = null;
    }).ensure(function () {
        return when.resolve();
    });
};

ICollegeMailer.prototype.isWindows = function () {
    return process.platform === 'win32';
};

ICollegeMailer.prototype.detectSendmail = function () {
    if (this.isWindows()) {
        return when.reject();
    }
    return when.promise(function (resolve, reject) {
        cp.exec('which sendmail', function (err, stdout) {
            if (err && !/bin\/sendmail/.test(stdout)) {
                return reject();
            }
            resolve(stdout.toString().replace(/(\n|\r|\r\n)$/, ''));
        });
    });
};

ICollegeMailer.prototype.createTransport = function () {
    this.transport = nodemailer.createTransport(config().mail.transport, _.clone(config().mail.options) || {});
};


ICollegeMailer.prototype.fromAddress = function () {
    var from = config().mail && config().mail.mailfrom,
        domain;

    if (!from) {
        // Extract the domain name from url set in config.js
        domain = config().url.match(new RegExp("^https?://([^/:?#]+)(?:[/:?#]|$)", "i"));
        domain = domain && domain[1];

        // Default to icollege@[blog.url]
        from = 'icollege@' + domain;
    }

    return from;
};

// Sends an e-mail message enforcing `to` (blog owner) and `from` fields
// This assumes that api.settings.read('email') was aready done on the API level
ICollegeMailer.prototype.send = function (message) {
    var self = this,
        to,
        sendMail;

    message = message || {};
    to = message.to || false;

    if (!this.transport) {
        return when.reject(new Error('Email Error: No e-mail transport configured.'));
    }

    if (!(message && message.subject && message.html && message.to)) {
        return when.reject(new Error('Email Error: Incomplete message data.'));
    }
    sendMail = nodefn.lift(self.transport.sendMail.bind(self.transport));

    message = _.extend(message, {
        from: self.fromAddress(),
        to: to,
        generateTextFromHTML: true
    });
    return sendMail(message);
};

module.exports = new ICollegeMailer();
