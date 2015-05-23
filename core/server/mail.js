// # 邮件模块
// 本模块负责实现邮件发送的底层逻辑，api模块可能会直接调用本模块


var _          = require('lodash'),
    Promise    = require('bluebird'),
    nodemailer = require('nodemailer'),
    validator  = require('validator'),
    config     = require('./config');

function Mailer(opts) {
    opts = opts || {};
    this.transport = opts.transport || null;
}

// ## E-mail transport setup
// *This promise should always resolve to avoid halting iCollege::init*.
Mailer.prototype.init = function () {
    var self = this;
    self.state = {};
    if (config.mail && config.mail.transport) {
        this.createTransport();
        return Promise.resolve();
    }

    // using direct transport
    self.transport = nodemailer.createTransport();
    self.state.usingDirect = true;
    self.transport.transportType = "DIRECT";

    return Promise.resolve();
};

Mailer.prototype.createTransport = function () {
    this.transport = nodemailer.createTransport(_.clone(config.mail.options) || {});
    this.transport.transportType = config.mail.transport;
};

Mailer.prototype.from = function () {
    var from = config.mail && (config.mail.mailfrom || config.mail.fromaddress);

    // If we don't have a from address at all
    if (!from) {
        // Default to icollege@[blog.url]
        from = 'icollege@' + this.getDomain();
    }

    // If we do have a from address, and it's just an email
    if (validator.isEmail(from)) {
        if (!config.theme.title) {
            config.theme.title = 'iCollege at ' + this.getDomain();
        }
        from = config.theme.title + ' <' + from + '>';
    }

    return from;
};

// Moved it to its own module
Mailer.prototype.getDomain = function () {
    var domain = config.url.match(new RegExp('^https?://([^/:?#]+)(?:[/:?#]|$)', 'i'));
    return domain && domain[1];
};

// Sends an e-mail message enforcing `to` (blog owner) and `from` fields
// This assumes that api.settings.read('email') was aready done on the API level
Mailer.prototype.send = function (message) {
    var self = this,
        to,
        sendMail;

    message = message || {};
    to = message.to || false;

    if (!this.transport) {
        return Promise.reject(new Error('Email Error: No e-mail transport configured.'));
    }
    if (!(message && message.subject && message.html && message.to)) {
        return Promise.reject(new Error('Email Error: Incomplete message data.'));
    }
    sendMail = Promise.promisify(self.transport.sendMail.bind(self.transport));

    message = _.extend(message, {
        from: self.from(),
        to: to,
        encoding: 'base64'
    });

    return new Promise(function (resolve, reject) {
        sendMail(message, function (error, response) {
            if (error) {
                return reject(new Error(error));
            }

            if (self.transport.transportType !== 'DIRECT') {
                return resolve(response);
            }

            // **Email Status Handler Has Been Deprecated in nodemailer v1.*
            //response.statusHandler.once('failed', function (data) {
            //    var reason = 'Email Error: Failed sending email';
            //    if (data.error.errno === 'ENOTFOUND') {
            //        reason += ': there is no mail server at this address: ' + data.domain;
            //    }
            //    reason += '.';
            //    return reject(new Error(reason));
            //});

            //response.statusHandler.once('requeue', function (data) {
            //    return reject(new Error('Email Error: message was not sent, requeued. Probably will not be sent. :( \nMore info: ' + data.error.message));
            //});

            //response.statusHandler.once('sent', function () {
            //    return resolve('Message was accepted by the mail server. Make sure to check inbox and spam folders. :)');
            //});
        });
    });
};

module.exports = new Mailer();
