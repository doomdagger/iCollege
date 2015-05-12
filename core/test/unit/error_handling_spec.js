/*globals describe, beforeEach, afterEach, it*/
/*jshint expr:true*/
var should     = require('should'),
    Promise    = require('bluebird'),
    sinon      = require('sinon'),
    rewire     = require('rewire'),

// Stuff we are testing

    colors     = require('colors'),
    errors     = rewire('../../server/errors'),
// storing current environment
    currentEnv = process.env.NODE_ENV;

// This is not useful but required for jshint
colors.setTheme({silly: 'rainbow'});

describe('Error handling', function () {
    // Just getting rid of jslint unused error
    should.exist(errors);

    describe('Throwing', function () {
        it('throws error objects', function () {
            var toThrow = new Error('test1'),
                runThrowError = function () {
                    errors.throwError(toThrow);
                };

            runThrowError.should['throw']('test1');
        });

        it('throws error strings', function () {
            var toThrow = 'test2',
                runThrowError = function () {
                    errors.throwError(toThrow);
                };

            runThrowError.should['throw']('test2');
        });

        it('throws error even if nothing passed', function () {
            var runThrowError = function () {
                errors.throwError();
            };

            runThrowError.should['throw']('An error occurred');
        });
    });

    describe('Warn Logging', function () {
        var logStub,
        // Can't use afterEach here, because mocha uses console.log to output the checkboxes
        // which we've just stubbed, so we need to restore it before the test ends to see ticks.
            resetEnvironment = function () {
                logStub.restore();
                process.env.NODE_ENV = currentEnv;
            };

        beforeEach(function () {
            logStub = sinon.stub(console, 'log');
            process.env.NODE_ENV = 'development';
        });

        afterEach(function () {
            logStub.restore();
        });

        it('logs default warn with no message supplied', function () {
            errors.logWarn();

            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                '\nWarning: no message supplied'.yellow, '\n');

            // Future tests: This is important here!
            resetEnvironment();
        });

        it('logs warn with only message', function () {
            var errorText = 'Error1';

            errors.logWarn(errorText);

            logStub.calledOnce.should.be.true;
            logStub.calledWith(('\nWarning: ' + errorText).yellow, '\n');

            // Future tests: This is important here!
            resetEnvironment();
        });

        it('logs warn with message and context', function () {
            var errorText = 'Error1',
                contextText = 'Context1';

            errors.logWarn(errorText, contextText);

            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                ('\nWarning: ' + errorText).yellow, '\n', contextText.white, '\n'
            );

            // Future tests: This is important here!
            resetEnvironment();
        });

        it('logs warn with message and context and help', function () {
            var errorText = 'Error1',
                contextText = 'Context1',
                helpText = 'Help1';

            errors.logWarn(errorText, contextText, helpText);

            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                ('\nWarning: ' + errorText).yellow, '\n', contextText.white, '\n', helpText.green, '\n'
            );

            // Future tests: This is important here!
            resetEnvironment();
        });
    });

    describe('Error Logging', function () {
        var logStub;

        beforeEach(function () {
            logStub = sinon.stub(console, 'error');
            // give environment a value that will console log
            process.env.NODE_ENV = 'development';
        });

        afterEach(function () {
            logStub.restore();
            // reset the environment
            process.env.NODE_ENV = currentEnv;
        });

        it('logs errors from error objects', function () {
            var err = new Error('test1');

            errors.logError(err);

            // Calls log with message on Error objects
            logStub.calledOnce.should.be.true;
            logStub.calledWith('\nERROR:'.red,  err.message.red, '\n', '\n', err.stack, '\n').should.be.true;
        });

        it('logs errors from strings', function () {
            var err = 'test2';

            errors.logError(err);

            // Calls log with string on strings
            logStub.calledOnce.should.be.true;
            logStub.calledWith('\nERROR:'.red, err.red, '\n').should.be.true;
        });

        it('logs errors from an error object and two string arguments', function () {
            var err = new Error('test1'),
                message = 'Testing';

            errors.logError(err, message, message);

            // Calls log with message on Error objects
            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                '\nERROR:'.red, err.message.red, '\n', message.white, '\n', message.green, '\n', err.stack, '\n'
            );
        });

        it('logs errors from three string arguments', function () {
            var message = 'Testing';

            errors.logError(message, message, message);

            // Calls log with message on Error objects
            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                '\nERROR:'.red, message.red, '\n', message.white, '\n', message.green, '\n'
            ).should.be.true;
        });

        it('logs errors from an undefined error argument', function () {
            var message = 'Testing';

            errors.logError(undefined, message, message);

            // Calls log with message on Error objects

            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                '\nERROR:'.red, 'An unknown error occurred.'.red, '\n', message.white, '\n', message.green, '\n'
            ).should.be.true;
        });

        it('logs errors from an undefined context argument', function () {
            var message = 'Testing';

            errors.logError(message, undefined, message);

            // Calls log with message on Error objects

            logStub.calledOnce.should.be.true;
            logStub.calledWith('\nERROR:'.red, message.red, '\n', message.green, '\n').should.be.true;
        });

        it('logs errors from an undefined help argument', function () {
            var message = 'Testing';

            errors.logError(message, message, undefined);

            // Calls log with message on Error objects

            logStub.calledOnce.should.be.true;
            logStub.calledWith('\nERROR:'.red, message.red, '\n', message.white, '\n').should.be.true;
        });

        it('logs errors from a null error argument', function () {
            var message = 'Testing';

            errors.logError(null, message, message);

            // Calls log with message on Error objects

            logStub.calledOnce.should.be.true;
            logStub.calledWith(
                '\nERROR:'.red, 'An unknown error occurred.'.red, '\n', message.white, '\n', message.green, '\n'
            ).should.be.true;
        });

        it('logs errors from a null context argument', function () {
            var message = 'Testing';

            errors.logError(message, null, message);

            // Calls log with message on Error objects

            logStub.calledOnce.should.be.true;
            logStub.firstCall.calledWith('\nERROR:'.red, message.red, '\n', message.green, '\n').should.be.true;
        });

        it('logs errors from a null help argument', function () {
            var message = 'Testing';

            errors.logError(message, message, null);

            // Calls log with message on Error objects

            logStub.calledOnce.should.be.true;
            logStub.firstCall.calledWith('\nERROR:'.red, message.red, '\n', message.white, '\n').should.be.true;
        });

        it('logs promise errors and redirects', function (done) {
            var req = null,
                res = {
                    redirect: function () {
                        return;
                    }
                },
                redirectStub = sinon.stub(res, 'redirect');

            // give environment a value that will console log
            Promise.reject().then(function () {
                throw new Error('Ran success handler');
            }, errors.logErrorWithRedirect('test1', null, null, '/testurl', req, res));

            Promise.reject().catch(function () {
                logStub.calledWith('\nERROR:'.red, 'test1'.red).should.equal(true);
                logStub.restore();

                redirectStub.calledWith('/testurl').should.equal(true);
                redirectStub.restore();

                done();
            });
        });
    });
});
