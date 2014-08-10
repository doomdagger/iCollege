// # Mail API
// API for sending Mail
var when       = require("when"),
    config     = require('../config'),
    errors     = require('../errors'),
    path           = require('path'),
    templatesDir   = path.resolve(__dirname, '..', 'views'),
    emailTemplates = require('email-templates'),
    mail;

/**
 * ## Mail API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 * @typedef Object
 * @param mail
 */
mail = {
    /**
     * ### Send
     * Send an email
     *
     * @public
     * @param {Object} object details of the email to send
     * @returns {Promise}
     */
    send: function (object) {
        var mailer = require('../mail');

        // TODO: permissions
        return mailer.send(object.mail[0].message)
            .then(function (data) {
                delete object.mail[0].options;
                // Sendmail returns extra details we don't need and that don't convert to JSON
                delete object.mail[0].message.transport;
                object.mail[0].status = {
                    message: data.message
                };
                return object;
            })
            .otherwise(function (error) {
                return when.reject(new errors.EmailError(error.message));
            });
    },
    /**
     * ### SendTest
     * Send a test email
     *
     * @public
     * @returns {Promise}
     */
    'sendTest': function () {
        var html = '<p><strong>Hello there!</strong></p>' +
                '<p>Excellent!' +
                ' You\'ve successfully setup your email config for your iCollege blog over on ' + config().url + '</p>' +
                '<p>If you hadn\'t, you wouldn\'t be reading this email, but you are, so it looks like all is well :)</p>' +
                '<p>xoxo</p>' +
                '<p>Team iCollege<br>' +
                '<a href="https://codeholic.org">https://codeholic.org</a></p>',

            payload = {mail: [{
                message: {
                    subject: 'Test iCollege Email',
                    html: html,
                    to: config().mail ? config().mail.mailto : 'icollege@icollege.com'
                }
            }]};

        return mail.send(payload);
    },

    /**
     * ### Generate Mail Object based on template
     * @param {String} templateName
     * @param {Object} [locals]
     * @return {Object} Mail Object
     */
    generateMailTemplate: function (templateName, locals) {
        var generated = when.defer();

        emailTemplates(templatesDir, function(err, template) {

            if (err) {
                generated.reject(err);
            } else {
                template(templateName, locals, function(err, html, text) {
                    if (err) {
                        generated.reject(err);
                    } else {
                        generated.resolve({
                            html: html,
                            // generateTextFromHTML: true,
                            text: text
                        })
                    }
                });
            }
        });

        return generated.promise;
    },

    /**
     * ### SendTemplateTest based on template
     * Send a test email
     *
     * @public
     * @returns {Promise}
     */
    'sendTemplateTest': function () {
        return mail.generateMailTemplate("mail_test", {
            email: 'mamma.mia@spaghetti.com',
            name: {
                first: 'Mamma',
                last: 'Mia'
            }
        }).then(function (message) {
            message.subject = 'Test iCollege Email';
            message.to = config().mail ? config().mail.mailto : 'icollege@icollege.com';
            var payload = {mail: [{
                message: message
            }]};

            return mail.send(payload);
        });
    }
};
module.exports = mail;