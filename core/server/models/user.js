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
    activeStates   = ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked'],
    invitedStates  = ['invited', 'invited-pending'],
    //loginStates   = ['online', 'invisible', 'offline'],

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
        } else if (this._id) {
            return this._id;
        } else {
            errors.logAndThrowError(new Error('missing context'));
        }
    },

    jsonify: function () {
        var attrs = icollegeShelf.Model.prototype.jsonify.apply(this, arguments);
        // remove password hash for security reasons
        delete attrs.password;

        return attrs;
    },

    format: function (options) {
        if (!_.isEmpty(options.website) &&
            !validator.isURL(options.website, {
                require_protocol: true,
                protocols: ['http', 'https']})) {
            options.website = 'http://' + options.website;
        }
        return options;
    },

    hasRole: function (roleName) {
        var roles = this.roles;

        return roles.some(function (role) {
            return role.name === roleName;
        });
    }

}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    /**
     * Returns an array of keys permitted in a method's `options` hash, depending on the current method.
     * @param {String} methodName The name of the method to check valid options for.
     * @return {Array} Keys allowed in the `options` hash of the model's method.
     */
    permittedOptions: function (methodName) {
        var options = icollegeShelf.Model.permittedOptions(),

        // whitelists for the `options` hash argument on methods, by method name.
        // these are the only options that can be passed to Bookshelf / Knex.
            validOptions = {
                findSingle: ['status'],
                setup: ['_id', 'id'],
                edit: ['_id', 'id'],
                findPage: ['page', 'limit', 'status', 'where', 'whereIn', 'role']
            };

        if (validOptions[methodName]) {
            options = options.concat(validOptions[methodName]);
        }

        return options;
    },

    /**
     * ### Find All
     * @param {Object} options
     * @returns {*}
     */
    findAll:  function (options) {
        options = options || {};
        options.withRelated = _.union(options.withRelated, options.include);
        return icollegeShelf.Model.findAll.call(this, options);
    },

    /**
     * #### findPage
     * Find results by page - returns an object containing the
     * information about the request (page, limit), along with the
     * info needed for pagination (pages, total).
     *
     * **response:**
     *
     *     {
     *         users: [
     *              {...}, {...}, {...}
     *          ],
     *          meta: {
     *              page: __,
     *              limit: __,
     *              pages: __,
     *              total: __
     *         }
     *     }
     *
     * @param {Object} options
     */
    findPage: function (options) {
        options = options || {};

        var userCollection = User.find(),
            roleInstance = options.role !== undefined;

        if (options.limit && options.limit !== 'all') {
            options.limit = parseInt(options.limit, 10) || 15;
        }

        if (options.page) {
            options.page = parseInt(options.page, 10) || 1;
        }

        options = this.filterOptions(options, 'findPage');

        // Set default settings for options
        options = _.extend({
            page: 1, // pagination page
            limit: 15,
            status: 'active',
            where: {},
            whereIn: {}
        }, options);

        // TODO: there are multiple statuses that make a user "active" or "invited" - we a way to translate/map them:
        // TODO (cont'd from above): * valid "active" statuses: active, warn-1, warn-2, warn-3, warn-4, locked
        // TODO (cont'd from above): * valid "invited" statuses" invited, invited-pending

        // Filter on the status.  A status of 'all' translates to no filter since we want all statuses
        if (options.status && options.status !== 'all') {
            // make sure that status is valid
            // TODO: need a better way of getting a list of statuses other than hard-coding them...
            options.status = _.indexOf(
                ['active', 'warn-1', 'warn-2', 'warn-3', 'warn-4', 'locked', 'invited', 'inactive'],
                options.status) !== -1 ? options.status : 'active';
        }

        if (options.status === 'active') {
            userCollection.where('status').in(activeStates);
        } else if (options.status === 'invited') {
            userCollection.where('status').in(invitedStates);
        } else if (options.status !== 'all') {
            options.where.status = options.status;
        }

        // If there are where conditionals specified, add those
        // to the query.
        if (options.where) {
            _.each(options.where, function (n, key) {
                userCollection.where(key).equals(n);
            });
        }

        // Add related objects
        options.withRelated = _.union(options.withRelated, options.include);

        // only include a limit-query if a numeric limit is provided
        if (_.isNumber(options.limit)) {
            userCollection
                .skip(options.limit * (options.page - 1))
                .limit(options.limit);
        }

        function fetchRoleQuery() {
            if (roleInstance) {
                return mongoose.model('Role').findSingle({name: options.role});
            }
            return false;
        }

        return Promise.resolve(fetchRoleQuery())
            .then(function (fetchedRole) {
                roleInstance = fetchedRole;

                function fetchCollection() {
                    if (roleInstance) {
                        userCollection
                            .elemMatch('roles', {$eq: roleInstance._id});
                    }

                    if (options.withRelated) {
                        _.each(options.withRelated, function (n) {
                            userCollection.populate(n);
                        });
                    }

                    return userCollection
                        .sort({ last_login: 'desc', name: 'asc', created_at: 'desc' })
                        .execAsync();
                }

                function fetchPaginationData() {
                    var qb;

                    // After we're done, we need to figure out what
                    // the limits are for the pagination values.
                    qb = User.where();

                    if (options.where) {
                        _.each(options.where, function (n, key) {
                            qb.where(key).equals(n);
                        });
                    }

                    if (roleInstance) {
                        qb.elemMatch('roles', {$eq: roleInstance._id});
                    }

                    return qb.count();
                }

                return Promise.join(fetchCollection(), fetchPaginationData());
            })
            // Format response of data
            .then(function (results) {
                var totalUsers = parseInt(results[1], 10),
                    calcPages = Math.ceil(totalUsers / options.limit) || 0,
                    pagination = {},
                    meta = {},
                    data = {};

                pagination.page = options.page;
                pagination.limit = options.limit;
                pagination.pages = calcPages === 0 ? 1 : calcPages;
                pagination.total = totalUsers;
                pagination.next = null;
                pagination.prev = null;


                data.users = _.map(results[0], function (n) {
                    return n.jsonify();
                });
                data.meta = meta;
                meta.pagination = pagination;

                if (pagination.pages > 1) {
                    if (pagination.page === 1) {
                        pagination.next = pagination.page + 1;
                    } else if (pagination.page === pagination.pages) {
                        pagination.prev = pagination.page - 1;
                    } else {
                        pagination.next = pagination.page + 1;
                        pagination.prev = pagination.page - 1;
                    }
                }

                if (roleInstance) {
                    meta.filters = {};
                    meta.filters.roles = [roleInstance.jsonify()];
                }

                return data;
            })
            .catch(errors.logAndThrowError);
    },

    /**
     * ### Find One
     * @extends icollegeShelf.Model.findSingle to include roles
     * **See:** [icollegeShelf.Model.findSingle](base.js.html#Find%20One)
     */
    findSingle: function (data, options) {
        var self = this,
            query,
            status,
            include;

        data = _.extend({
            status: 'active'
        }, data || {});

        status = data.status;
        delete data.status;

        options = this.filterOptions(options, 'findSingle');
        options.withRelated = _.union(options.withRelated, options.include);

        function fetchRoleQuery() {
            if (data.role) {
                return mongoose.model('Role').findSingle({name: data.role});
            }
            return false;
        }

        return Promise.resolve(fetchRoleQuery())
            .then(function (fetchedRole) {
                data = self.filterData(data);
                include = (options.include !== undefined) ? options.include.join(' ') : null;

                query = self.findOne(data, include);

                // Support finding by role
                if (fetchedRole) {
                    options.withRelated.push('roles');
                    query.elemMatch('roles', {$eq: fetchedRole._id});
                }

                if (status === 'active') {
                    query.where('status').in(activeStates);
                } else if (status === 'invited') {
                    query.where('status').in(invitedStates);
                } else if (status !== 'all') {
                    query.where('status').equals(options.status);
                }

                if (options.withRelated) {
                    _.each(options.withRelated, function (n) {
                        query.populate(n);
                    });
                }

                return query.execAsync();
            });
    },

    /**
     * ### Edit
     * @extends icollegeShelf.Model.edit to handle returning the full object
     * **See:** [icollegeShelf.Model.edit](base.js.html#edit)
     */
    edit: function (data, options) {
        var self = this;

        if (data.roles && data.roles.length > 1) {
            return Promise.reject(
                new errors.ValidationError('Only one role per user is supported at the moment.')
            );
        }

        options = options || {};
        options.withRelated = _.union(options.withRelated, options.include);

        return icollegeShelf.Model.edit.call(self, data, options);
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
            userData = this.filterData(data),
            roles;

        options = this.filterOptions(options, 'add');
        options.withRelated = _.union(options.withRelated, options.include);

        // check for too many roles
        if (data.roles && data.roles.length > 1) {
            return Promise.reject(new errors.ValidationError('Only one role per user is supported at the moment.'));
        }

        if (!validatePasswordLength(userData.password)) {
            return Promise.reject(new errors.ValidationError('Your password must be at least 8 characters long.'));
        }

        function getICollegerRole() {
            return mongoose.model('Role').findSingle({name: 'iColleger'}).then(function (icollegerRole) {
                return [icollegerRole._id];
            });
        }

        roles = data.roles || getICollegerRole();
        delete data.roles;

        // if we are given a "role" object, only pass in the role ID in place of the full object
        return Promise.resolve(roles).then(function (roles) {
            userData.roles = roles;
        }).then(function () {
            return generatePasswordHash(userData.password);
        }).then(function (results) {
            // Assign the hashed password
            userData.password = results;
            // LookupGravatar
            return self.gravatarLookup(userData);
        }).then(function (userData) {
            // Save the user with the hashed password
            return icollegeShelf.Model.add.call(self, userData, options);
        }).then(function (addedUser) {
            // Assign the userData to our created user so we can pass it back
            userData = addedUser;
            // find and return the added user
            return self.findSingle({_id: userData._id, status: 'all'}, options);
        });
    },

    /**
     * setup user
     * @param data
     * @param options
     * @returns {*}
     */
    setup: function (data, options) {
        var self = this,
            userData = this.filterData(data);

        if (!validatePasswordLength(userData.password)) {
            return Promise.reject(new errors.ValidationError('Your password must be at least 8 characters long.'));
        }

        options = this.filterOptions(options, 'setup');
        options.withRelated = _.union(options.withRelated, options.include);
        options.shortSlug = true;

        return generatePasswordHash(data.password).then(function (hash) {
            // Assign the hashed password
            userData.password = hash;

            return Promise.join(self.gravatarLookup(userData),
                icollegeShelf.Model.generateSlug.call(this, User, userData.name, options));
        }).then(function (results) {
            userData = results[0];
            userData.slug = results[1];

            return self.edit.call(self, userData, options);
        });
    },

    /**
     * look gravatar on the internet
     * @param userData
     * @returns {Promise|exports|module.exports}
     */
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

    permissible: function (userModelOrId, action, context, loadedPermissions, hasUserPermission, hasAppPermission) {
        var self = this,
            userModel = userModelOrId,
            origArgs;

        // If our action is **add**, skip all these logic, adduser logic only is only tested by permission map
        // permissible should not blend into this
        if (action === 'add') {
            if (hasUserPermission && hasAppPermission) {
                return Promise.resolve();
            }

            return Promise.reject();
        }

        // now only read, edit, destory can come to here, so the user must exist and have a role, if not, throw an error
        // If we passed in a model without its related roles, we need to fetch it again
        if (_.isObject(userModelOrId)) {
            // we presume roles must be an array
            if (userModelOrId.roles.length > 0) {
                if (_.isString(userModelOrId.roles[0])) {
                    userModelOrId = userModelOrId._id;
                }
            } else {
                errors.logAndThrowError("A user without role? An Fatal Error Here!", __dirname, "try look up methods in models/user.js");
            }
        }
        // If we passed in an id instead of a model get the model first
        if (_.isNumber(userModelOrId) || _.isString(userModelOrId)) {
            // Grab the original args without the first one
            origArgs = _.toArray(arguments).slice(1);
            // Get the actual post model
            return this.findSingle({_id: userModelOrId, status: 'all'}, {withRelated: ['roles']}).then(function (foundUserModel) {
                // Build up the original args but substitute with actual model
                var newArgs = [foundUserModel].concat(origArgs);

                return self.permissible.apply(self, newArgs);
            }, errors.logAndThrowError);
        }

        if (action === 'edit') {
            // Users with the role 'Administrator' and 'iColleger' have complex permissions when the action === 'edit'
            // We now have all the info we need to construct the permissions
            if (_.any(loadedPermissions.user.roles, {name: 'Administrator'})) {
                // If this is the same user that requests the operation allow it.
                hasUserPermission = context.user === userModel._id;

                // iColleger can be edited by Administrator
                hasUserPermission = hasUserPermission || userModel.hasRole('iColleger');
            }

            if (_.any(loadedPermissions.user.roles, {name: 'iColleger'})) {
                // If this is the same user that requests the operation allow it.
                hasUserPermission = hasUserPermission || context.user === userModel._id;
            }
        }

        if (action === 'destroy') {
            // SuperAdministrator cannot be deleted EVER
            if (userModel.hasRole('SuperAdministrator')) {
                return Promise.reject();
            }

            // Users with the role 'Administrator' have complex permissions when the action === 'destroy'
            if (_.any(loadedPermissions.user.roles, {name: 'Administrator'})) {
                // If this is the same user that requests the operation allow it.
                hasUserPermission = context.user === userModel._id;

                // Alternatively, if the user we are trying to edit is an iColleger, allow it
                hasUserPermission = hasUserPermission || userModel.hasRole('iColleger');
            }

            // Users with the role 'iColleger' have complex permissions when the action === 'destroy'
            if (_.any(loadedPermissions.user.roles, {name: 'iColleger'})) {
                // If this is the same user that requests the operation allow it.
                hasUserPermission = hasUserPermission || context.user === userModel._id;
            }
        }

        if (hasUserPermission && hasAppPermission) {
            return Promise.resolve();
        }

        return Promise.reject();
    },

    setWarning: function (user, options) {
        var status = user.get('status'),
            regexp = /warn-(\d+)/i,
            level;

        if (status === 'active') {
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

        return Promise.resolve(user.__save(options)).then(function () {
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

                    return Promise.resolve(user.set({status: 'active', login_status: 'online', last_login: new Date()}).__save())
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

        return self.findSingle({_id: userId}).then(function (_user) {
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
            return user.set({password: hash}).__save();
        });
    },

    generateResetToken: function (name, expires, dbHash) {
        return this.getByName(name).then(function (foundUser) {
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
                self.getByName(name),
                generatePasswordHash(newPassword)
            );
        }).then(function (results) {
            if (!results[0]) {
                return Promise.reject(new Error('User not found'));
            }

            // Update the user with the new password hash
            var foundUser = results[0],
                passwordHash = results[1];

            return foundUser.set({password: passwordHash, status: 'active'}).__save();
        });
    },

    // Get the user by name, enforces case sensitivity
    getByName: function (name, options) {
        options = options || {};

        // user findSingle from icollegeShelf to make the fetch process simple
        return icollegeShelf.Model.findSingle.call(this, {name: name}, options);
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
                {shortSlug: !this.get('slug'), status: 'all'})
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
