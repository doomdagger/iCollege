/*jslint regexp: true */
var _                          = require('lodash'),
    colors                     = require('colors'),
    config                     = require('../config'),
    path                       = require('path'),
    NotFoundError              = require('./notfounderror'),
    BadRequestError            = require('./badrequesterror'),
    InternalServerError        = require('./internalservererror'),
    NoPermissionError          = require('./nopermissionerror'),
    RequestEntityTooLargeError = require('./requesttoolargeerror'),
    UnauthorizedError          = require('./unauthorizederror'),
    ValidationError            = require('./validationerror'),
    EmailError                 = require('./emailerror'),
    errors;

// This is not useful but required for jshint
colors.setTheme({silly: 'rainbow'});

/**
 * Basic error handling helpers
 */
errors = {

    throwError: function (err) {
        if (!err) {
            err = new Error("An error occurred");
        }

        if (_.isString(err)) {
            throw new Error(err);
        }

        throw err;
    },

    // ## Reject Error
    // Used to pass through promise errors when we want to handle them at a later time
    // this can be handled by calling deferred.resolve(rejectError(err))
    rejectError: function (err) {
        return Q.fcall(function(){
            this.throwError(err);
        });
    },

    debug: function(msg, context, help) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {

            var msgs = ['\nDebugging:'.yellow, msg.yellow, '\n'];

            if (context) {
                msgs.push(context.white, '\n');
            }

            if (help) {
                msgs.push(help.green);
            }

            // add a new line
            msgs.push('\n');

            console.log.apply(console, msgs);
        }
    },

    logWarn: function (warn, context, help) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {

            var msgs = ['\nWarning:'.yellow, warn.yellow, '\n'];

            if (context) {
                msgs.push(context.white, '\n');
            }

            if (help) {
                msgs.push(help.green);
            }

            // add a new line
            msgs.push('\n');

            console.log.apply(console, msgs);
        }
    },

    logError: function (err, context, help) {
        var stack = err ? err.stack : null,
            msgs;

        if (err) {
            err = err.message || err || 'An unknown error occurred.';
        } else {
            err = 'An unknown error occurred.';
        }
        // TODO: Logging framework hookup
        // Eventually we'll have better logging which will know about envs
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {

            msgs = ['\nERROR:'.red, err.red, '\n'];

            if (context) {
                msgs.push(context.white, '\n');
            }

            if (help) {
                msgs.push(help.green);
            }

            // add a new line
            msgs.push('\n');

            if (stack) {
                msgs.push(stack, '\n');
            }

            console.error.apply(console, msgs);
        }
    },

    logErrorAndExit: function (err, context, help) {
        this.logError(err, context, help);
        // Exit with 0 to prevent npm errors as we have our own
        process.exit(0);
    },

    logAndThrowError: function (err, context, help) {
        this.logError(err, context, help);

        this.throwError(err, context, help);
    }
};

// Ensure our 'this' context for methods and preserve method arity by
// using Function#bind for expressjs
_.each([
    'logAndThrowError'
], function (funcName) {
    errors[funcName] = errors[funcName].bind(errors);
});

module.exports                            = errors;
module.exports.NotFoundError              = NotFoundError;
module.exports.BadRequestError            = BadRequestError;
module.exports.InternalServerError        = InternalServerError;
module.exports.NoPermissionError          = NoPermissionError;
module.exports.UnauthorizedError          = UnauthorizedError;
module.exports.ValidationError            = ValidationError;
module.exports.RequestEntityTooLargeError = RequestEntityTooLargeError;
module.exports.EmailError                 = EmailError;
