// # User Model

var Promise        = require('bluebird'),
    bcrypt         = require('bcryptjs'),
    icollegeShelf = require('./base'),
    crypto         = require('crypto'),
    errors         = require('../errors'),
    utils          = require('../utils'),
    config         = require('../config'),
    validator      = require('validator'),
    request        = require('request'),
    _              = require('lodash'),

    // inter-require for different models
    mongoose           = require('mongoose'),

    bcryptGenSalt  = Promise.promisify(bcrypt.genSalt),
    bcryptHash     = Promise.promisify(bcrypt.hash),
    bcryptCompare  = Promise.promisify(bcrypt.compare),

    tokenSecurity  = {},
    normalStates   = ['online', 'invisible', 'offline'],

    User,
    Users;

function validatePasswordLength(password) {
    return validator.isLength(password, 8);
}

function generatePasswordHash(password) {
    // Generate a new salt
    return bcryptGenSalt().then(function (salt) {
        // Hash the provided password with bcrypt
        return bcryptHash(password, salt);
    });
}

Users = icollegeShelf.schema('users', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke

    // Get the user from the options object
    contextUser: function (options) {
        // Default to context user
        if (options.context && options.context.user) {
            return options.context.user;
            // Other wise use the internal override
        } else if (options.context && options.context.internal) {
            return config.adminId;
            // This is the user object, so try using this user's id
        } else if (this.get('id')) {
            return this.get('id');
        } else {
            errors.logAndThrowError(new Error('missing context'));
        }
    },

    jsonify: function () {
        var attrs = icollegeShelf.Model.prototype.jsonify.apply(this, arguments);
        // remove password hash for security reasons
        delete attrs.password;

        return attrs;
    }

}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    /**
     * ### Find All
     * @param {Object} [projection] string partitioned by space
     * @param {Object} options
     * @returns {*}
     */
    findAll:  function (projection, options) {
        options = options || {};
        return this.find({}, projection, options)
            .populate("roles permissions")
            .execAsync();
    },

    /**
     * ## Add
     * Naive user add
     * Hashes the password provided before saving to the database.
     *
     * @param {object} data
     * @param {object} options
     * @extends icollegeShelf.Model.add to manage all aspects of user signup
     * **See:** [icollegeShelf.Model.add](base.js.html#Add)
     */
    add: function (data, options) {
        var self = this,
            userData = this.filterData(data);

        options = this.filterOptions(options, 'add');

        // check for too many roles
        if (data.roles && data.roles.length > 1) {
            return Promise.reject(new errors.ValidationError('Only one role per user is supported at the moment.'));
        }

        if (!validatePasswordLength(userData.password)) {
            return Promise.reject(new errors.ValidationError('Your password must be at least 8 characters long.'));
        }

        function getICollegerRole() {
            return mongoose.model('Role').findOneAsync({name: 'iColleger'}).then(function (icollegerRole) {
                return [icollegerRole.get('id')];
            });
        }

        data.roles = data.roles || getICollegerRole();

        return generatePasswordHash(userData.password).then(function (results) {
            // Assign the hashed password
            userData.password = results[1];
            // LookupGravatar
            return self.gravatarLookup(userData);
        }).then(function (userData) {
            // Save the user with the hashed password
            return icollegeShelf.Model.add.call(self, userData, options);
        }).then(function (addedUser) {
            // Assign the userData to our created user so we can pass it back
            userData = addedUser[0];
            // find and return the added user
            return self.findOneAsync({_id: userData.id});
        });
    },

    gravatarLookup: function (userData) {
        var gravatarUrl = '//www.gravatar.com/avatar/' +
            crypto.createHash('md5').update(userData.email.toLowerCase().trim()).digest('hex') +
            '?s=250';

        return new Promise(function (resolve) {
            if (config.isPrivacyDisabled('useGravatar')) {
                return resolve(userData);
            }

            request({url: 'http:' + gravatarUrl + '&d=404&r=x', timeout: 2000}, function (err, response) {
                if (err) {
                    // just resolve with no image url
                    return resolve(userData);
                }

                if (response.statusCode !== 404) {
                    gravatarUrl += '&d=mm&r=x';
                    userData.avatar = gravatarUrl;
                }

                resolve(userData);
            });
        });
    },

    setWarning: function (user, options) {
        var status = user.get('status'),
            regexp = /warn-(\d+)/i,
            level;

        if (_.contains(normalStates, status)) {
            user.set('status', 'warn-1');
            level = 1;
        } else {
            level = parseInt(status.match(regexp)[1], 10) + 1;
            if (level > 3) {
                user.set('status', 'locked');
            } else {
                user.set('status', 'warn-' + level);
            }
        }

        return Promise.resolve(user.saveAsync(options)).then(function () {
            return 5 - level;
        });
    },

    // Finds the user by username, and checks the password
    check: function (object) {
        var self = this,
            s;
        return this.getByName(object.name).then(function (user) {
            if (!user) {
                return Promise.reject(new errors.NotFoundError('There is no user with that name.'));
            }
            if (user.get('status') === 'invited' || user.get('status') === 'invited-pending' ||
                user.get('status') === 'inactive'
            ) {
                return Promise.reject(new Error('The user with that name is inactive.'));
            }
            if (user.get('status') !== 'locked') {
                return bcryptCompare(object.password, user.get('password')).then(function (matched) {
                    if (!matched) {
                        return Promise.resolve(self.setWarning(user)).then(function (remaining) {
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

                    return Promise.resolve(user.set({status: 'online', last_login: new Date()}).saveAsync())
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
                return Promise.reject(new errors.NotFoundError('There is no user with that name.'));
            }

            return Promise.reject(error);
        });
    },

    /**
     * Naive change password method
     * @param {String} oldPassword
     * @param {String} newPassword
     * @param {String} ne2Password
     * @param {Integer} userId
     * @param {Object} options options should contains who initiate this operation
     */
    changePassword: function (oldPassword, newPassword, ne2Password, userId, options) {
        var self = this,
            user;

        if (newPassword !== ne2Password) {
            return Promise.reject(new errors.ValidationError('Your new passwords do not match'));
        }

        if (userId === options.context.user && _.isEmpty(oldPassword)) {
            return Promise.reject(new errors.ValidationError('Password is required for this operation'));
        }

        if (!validatePasswordLength(newPassword)) {
            return Promise.reject(new errors.ValidationError('Your password must be at least 8 characters long.'));
        }

        return self.findOneAsync({id: userId}).then(function (_user) {
            user = _user;
            if (userId === options.context.user) {
                return bcryptCompare(oldPassword, user.get('password'));
            }
            // if user is admin, password isn't compared
            return true;
        }).then(function (matched) {
            if (!matched) {
                return Promise.reject(new errors.ValidationError('Your password is incorrect'));
            }

            return generatePasswordHash(newPassword);
        }).then(function (hash) {
            return user.set({password: hash}).saveAsync();
        });
    },

    generateResetToken: function (name, expires, dbHash) {
        return this.findOneAsync({name: name}).then(function (foundUser) {
            if (!foundUser) {
                return Promise.reject(new errors.NotFoundError('There is no user with that name.'));
            }

            var hash = crypto.createHash('sha256'),
                text = '';

            // Token:
            // BASE64(TIMESTAMP + name + HASH(TIMESTAMP + name + oldPasswordHash + dbHash ))
            hash.update(String(expires));
            hash.update(name.toLocaleLowerCase());
            hash.update(foundUser.get('password'));
            hash.update(String(dbHash));

            text += [expires, name, hash.digest('base64')].join('|');
            return new Buffer(text).toString('base64');
        });
    },

    validateToken: function (token, dbHash) {
        /*jslint bitwise:true*/
        // TODO: Is there a chance the use of ascii here will cause problems if oldPassword has weird characters?
        var tokenText = new Buffer(token, 'base64').toString('ascii'),
            parts,
            expires,
            name;

        parts = tokenText.split('|');

        // Check if invalid structure
        if (!parts || parts.length !== 3) {
            return Promise.reject(new Error('Invalid token structure'));
        }

        expires = parseInt(parts[0], 10);
        name = parts[1];

        if (isNaN(expires)) {
            return Promise.reject(new Error('Invalid token expiration'));
        }

        // Check if token is expired to prevent replay attacks
        if (expires < Date.now()) {
            return Promise.reject(new Error('Expired token'));
        }

        // to prevent brute force attempts to reset the password the combination of name+expires is only allowed for
        // 10 attempts
        if (tokenSecurity[name + '+' + expires] && tokenSecurity[name + '+' + expires].count >= 10) {
            return Promise.reject(new Error('Token locked'));
        }

        return this.generateResetToken(name, expires, dbHash).then(function (generatedToken) {
            // Check for matching tokens with timing independent comparison
            var diff = 0,
                i;

            // check if the token length is correct
            if (token.length !== generatedToken.length) {
                diff = 1;
            }

            for (i = token.length - 1; i >= 0; i = i - 1) {
                diff |= token.charCodeAt(i) ^ generatedToken.charCodeAt(i);
            }

            if (diff === 0) {
                return name;
            }

            // increase the count for name+expires for each failed attempt
            tokenSecurity[name + '+' + expires] = {
                count: tokenSecurity[name + '+' + expires] ? tokenSecurity[name + '+' + expires].count + 1 : 1
            };
            return Promise.reject(new Error('Invalid token'));
        });
    },

    resetPassword: function (token, newPassword, ne2Password, dbHash) {
        var self = this;

        if (newPassword !== ne2Password) {
            return Promise.reject(new Error('Your new passwords do not match'));
        }

        if (!validatePasswordLength(newPassword)) {
            return Promise.reject(new errors.ValidationError('Your password must be at least 8 characters long.'));
        }

        // Validate the token; returns the name from token
        return self.validateToken(utils.decodeBase64URLsafe(token), dbHash).then(function (name) {
            // Fetch the user by name, and hash the password at the same time.
            return Promise.join(
                this.findOneAsync({name: name}),
                generatePasswordHash(newPassword)
            );
        }).then(function (results) {
            if (!results[0]) {
                return Promise.reject(new Error('User not found'));
            }

            // Update the user with the new password hash
            var foundUser = results[0],
                passwordHash = results[1];

            return foundUser.set({password: passwordHash, status: 'offline'}).saveAsync();
        });
    },

    getByName: function (name, options) {
        options = options || {};

        return this.findOneAsync({name: name}, null, options);
    }

}, {
    // #### Schema instance level
    initialize: function () {
        icollegeShelf.Schema.prototype.initialize.apply(this, arguments);

        // add slug generator, hook in before validate
        this.pre('validate', this.validating);
    },

    // This 'this' is Model Instance Object
    validating: function (next) {
        var self = this;

        if (!this.get('slug')) {
            // Generating a slug requires a db call to look for conflicting slugs
            return icollegeShelf.Model.generateSlug(User, this.get('slug') || this.get('name'),
                {shortSlug: !this.get('slug')})
                .then(function (slug) {
                    self.set({slug: slug});
                    next();
                });
        }
        next();
    }
});

User = icollegeShelf.model('User', Users);


module.exports = {
    User: User,
    Users: Users
};
