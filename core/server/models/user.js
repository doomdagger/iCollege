// # User Model

var //Promise        = require('bluebird'),
    //bcrypt         = require('bcryptjs'),
    icollegeShelf = require('./base'),
    //validator      = require('validator'),

    //bcryptGenSalt  = Promise.promisify(bcrypt.genSalt),
    //bcryptHash     = Promise.promisify(bcrypt.hash),
    //bcryptCompare  = Promise.promisify(bcrypt.compare),

    //tokenSecurity  = {},
    //activeStates   = ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked'],
    //invitedStates  = ['invited', 'invited-pending'],
    User,
    Users;

//function validatePasswordLength(password) {
//    return validator.isLength(password, 8);
//}
//
//function generatePasswordHash(password) {
//    // Generate a new salt
//    return bcryptGenSalt().then(function (salt) {
//        // Hash the provided password with bcrypt
//        return bcryptHash(password, salt);
//    });
//}

Users = icollegeShelf.schema('users', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke
    // TODO: finish check, ok?
    // Finds the user by username, and checks the password
    check: function (object) {
        var self = this,
            s;
        return this.findOneAsync({name: object.name}).then(function (user) {
            if (!user) {
                return Promise.reject(new errors.NotFoundError('There is no user with that email address.'));
            }
            if (user.get('status') === 'invited' || user.get('status') === 'invited-pending' ||
                user.get('status') === 'inactive'
            ) {
                return Promise.reject(new Error('The user with that email address is inactive.'));
            }
            if (user.get('status') !== 'locked') {
                return bcryptCompare(object.password, user.get('password')).then(function (matched) {
                    if (!matched) {
                        return Promise.resolve(self.setWarning(user, {validate: false})).then(function (remaining) {
                            s = (remaining > 1) ? 's' : '';
                            return Promise.reject(new errors.UnauthorizedError('Your password is incorrect.<br>' +
                            remaining + ' attempt' + s + ' remaining!'));

                            // Use comma structure, not .catch, because we don't want to catch incorrect passwords
                        }, function (error) {
                            // If we get a validation or other error during this save, catch it and log it, but don't
                            // cause a login error because of it. The user validation is not important here.
                            errors.logError(
                                error,
                                'Error thrown from user update during login',
                                'Visit and save your profile after logging in to check for problems.'
                            );
                            return Promise.reject(new errors.UnauthorizedError('Your password is incorrect.'));
                        });
                    }

                    return Promise.resolve(user.set({status: 'active', last_login: new Date()}).save({validate: false}))
                        .catch(function (error) {
                            // If we get a validation or other error during this save, catch it and log it, but don't
                            // cause a login error because of it. The user validation is not important here.
                            errors.logError(
                                error,
                                'Error thrown from user update during login',
                                'Visit and save your profile after logging in to check for problems.'
                            );
                            return user;
                        });
                }, errors.logAndThrowError);
            }
            return Promise.reject(new errors.NoPermissionError('Your account is locked due to too many ' +
            'login attempts. Please reset your password to log in again by clicking ' +
            'the "Forgotten password?" link!'));
        }, function (error) {
            if (error.message === 'NotFound' || error.message === 'EmptyResponse') {
                return Promise.reject(new errors.NotFoundError('There is no user with that email address.'));
            }

            return Promise.reject(error);
        });
    }

}, {
    // #### Schema instance level
    initialize: function () {
        icollegeShelf.Schema.prototype.initialize.apply(this, arguments);

        // TODO custom logic put here
    }
});

User = icollegeShelf.model('User', Users);


module.exports = {
    User: User,
    Users: Users
};
