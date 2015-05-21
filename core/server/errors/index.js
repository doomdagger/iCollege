/*jslint regexp: true */
var _                          = require('lodash'),
    colors                     = require('colors'),
    Promise                    = require('bluebird'),
    NotFoundError              = require('./not-found-error'),
    BadRequestError            = require('./bad-request-error'),
    InternalServerError        = require('./internal-server-error'),
    NoPermissionError          = require('./no-permission-error'),
    RequestEntityTooLargeError = require('./request-too-large-error'),
    UnauthorizedError          = require('./unauthorized-error'),
    ValidationError            = require('./validation-error'),
    UnsupportedMediaTypeError  = require('./unsupported-media-type-error'),
    EmailError                 = require('./email-error'),
    DataImportError            = require('./data-import-error'),
    errors;

// This is not useful but required for jshint
colors.setTheme({silly: 'rainbow'});

/**
 * Basic error handling helpers
 */
errors = {
    throwError: function (err) {
        if (!err) {
            err = new Error('An error occurred');
        }

        if (_.isString(err)) {
            throw new Error(err);
        }

        throw err;
    },

    // ## Reject Error
    // Used to pass through promise errors when we want to handle them at a later time
    rejectError: function (err) {
        return Promise.reject(err);
    },

    logInfo: function (component, info) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {
            var msg = [component.cyan + ':'.cyan, info.cyan];

            console.info.apply(console, msg);
        }
    },

    logWarn: function (warn, context, help) {
        if ((process.env.NODE_ENV === 'development' ||
            process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'production')) {
            warn = warn || 'no message supplied';
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
        var self = this,
            origArgs = _.toArray(arguments).slice(1),
            stack,
            msgs;

        if (_.isArray(err)) {
            _.each(err, function (e) {
                var newArgs = [e].concat(origArgs);
                errors.logError.apply(self, newArgs);
            });
            return;
        }

        stack = err ? err.stack : null;

        if (!_.isString(err)) {
            if (_.isObject(err) && _.isString(err.message)) {
                err = err.message;
            } else {
                err = 'An unknown error occurred.';
            }
        }

        // Overwrite error to provide information that this is probably a permission problem
        // TODO: https://github.com/TryGhost/Ghost/issues/3687
        if (err.indexOf('SQLITE_READONLY') !== -1) {
            context = 'Your database is in read only mode. Visitors can read your blog, but you can\'t log in or add posts.';
            help = 'Check your database file and make sure that file owner and permissions are correct.';
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
    },

    logAndRejectError: function (err, context, help) {
        this.logError(err, context, help);

        return this.rejectError(err, context, help);
    },

    logErrorWithRedirect: function (msg, context, help, redirectTo, req, res) {
        /*jshint unused:false*/
        var self = this;

        return function () {
            self.logError(msg, context, help);

            if (_.isFunction(res.redirect)) {
                res.redirect(redirectTo);
            }
        };
    },

    handleAPIError: function (error, permsMessage) {
        if (!error) {
            return this.rejectError(
                new this.NoPermissionError(permsMessage || 'You do not have permission to perform this action')
            );
        }

        if (_.isString(error)) {
            return this.rejectError(new this.NoPermissionError(error));
        }

        if (error.type) {
            return this.rejectError(error);
        }

        return this.rejectError(new this.InternalServerError(error));
    },

    // Do Not Remove **next** Param
    error404: function (req, res, next) {
        /*jshint unused:false*/
        var message = 'No iCollege Found';

        // do not cache 404 error
        res.set({'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'});

        res.status(404).send(message);
    },

    // Do Not Remove **next** Param
    error500: function (err, req, res, next) {
        // 500 errors should never be cached
        res.set({'Cache-Control': 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'});

        if (err.status === 404) {
            return this.error404(req, res, next);
        }

        var statusCode = 500,
            returnErrors = [];

        if (!_.isArray(err)) {
            err = [].concat(err);
        }

        _.each(err, function (errorItem) {
            var errorContent = {};

            statusCode = errorItem.code || 500;

            errorContent.message = _.isString(errorItem) ? errorItem :
                (_.isObject(errorItem) ? errorItem.message : 'Unknown Error');
            errorContent.type = errorItem.type || 'InternalServerError';
            returnErrors.push(errorContent);
        });

        res.status(statusCode).json({errors: returnErrors});
    }
};

// Ensure our 'this' context for methods and preserve method arity by
// using Function#bind for expressjs
_.each([
    'logWarn',
    'logInfo',
    'rejectError',
    'throwError',
    'logError',
    'logAndThrowError',
    'logAndRejectError',
    'logErrorAndExit',
    'logErrorWithRedirect',
    'handleAPIError',
    'error404',
    'error500'
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
module.exports.UnsupportedMediaTypeError  = UnsupportedMediaTypeError;
module.exports.EmailError                 = EmailError;
module.exports.DataImportError            = DataImportError;
