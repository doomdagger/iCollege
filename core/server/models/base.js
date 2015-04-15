// # Base Shelf
// This is the object from which all other iCollege models extend. The Shelf Object provides
// several basic behaviours such as UUIDs, as well as a set of Data methods for accessing information from the database.
//
// The models are internal to iCollege, only the API and some internal functions such as migration and import/export
// accesses the models directly. All other parts of iCollege are only
// allowed to access data via the API.

var _          = require('lodash'),
    mongoose   = require('mongoose'),
    Shelf      = require('./icollege-shelf'),
    errors     = require('../errors'),
    filters    = require('../filters'),
    utils      = require('../utils'),
    config     = require('../config'),
    moment     = require('moment'),
    sanitize   = require('validator').sanitize,
    schema     = require('../data/schema'),
    uuid       = require('node-uuid'),

    icollegeShelf;


// ### icollegeShelf
// Initializes a new Shelf instance called icollegeShelf, for reference elsewhere in iCollege.
icollegeShelf = new Shelf({
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke

    // we extend the set method of Mongoose
    // you can now also pass an object to instance, covering multiple attributes
    set: function (key, value) {
        if (arguments.length === 1) {
            if (_.isObject(key)) {
                _.each(key, function (k, v) {
                    this.set(k, v);
                });
                return this;
            }
            return this.options[key];
        } else {
            this.options[key] = value;
            return this;
        }
    },

    // Get permitted attributes from server/data/schema.js, which is where the DB schema is defined
    attributes: function () {
        return _.keys(schema.collections[this.schema.collectionName]);
    },

    // Return default model instance
    defaults: function () {
        return {
            uuid: uuid.v4()
        };
    },

    // Base prototype properties will go here
    // Fix problems with dates
    fixDates: function (attrs) {
        var self = this;

        _.each(attrs, function (value, key) {
            if (value !== null
                && schema.collections[self.schema.collectionName].hasOwnProperty(key)
                && schema.collections[self.schema.collectionName][key].type === Date) {
                // convert dateTime value into a native javascript Date object
                attrs[key] = moment(value).toDate();
            }
        });

        return attrs;
    },

    // Convert integers to real booleans
    fixBools: function (attrs) {
        var self = this;
        _.each(attrs, function (value, key) {
            if (schema.collections[self.schema.collectionName].hasOwnProperty(key)
                && schema.collections[self.schema.collectionName][key].type === Boolean) {
                attrs[key] = value ? true : false;
            }
        });

        return attrs;
    },

    // Get the user from the options object
    contextUser: function (options) {
        // Default to context user, it's an user id
        if (options.context && options.context.user) {
            return options.context.user;
            // Other wise use the internal override
        } else if (options.context && options.context.internal) {
            return mongoose.Types.ObjectId("ffffffffffffffffffffffff");
        } else {
            errors.logAndThrowError(new Error('missing context'));
        }
    },

    // 我们需要统一options绑定到Model Instance上的行为
    // 如果是Model类，请使用 Model.forge(data, options)
    // 如果是Model实例（model），请使用 model.bindOptions(options)
    //
    bindOptions: function (options, force) {
        if (!!this.options && force) {
            // 如果事先有options，直接删除
            delete this.options;
        }
        this.options = _.extend(this.options || {}, options);
        return this;
    },

    // format date before writing to DB, bools work
    format: function (attrs) {
        return this.fixDates(attrs);
    },

    // format data and bool when fetching from DB
    parse: function (attrs) {
        return this.fixBools(this.fixDates(attrs));
    },

    sanitize: function (attr) {
        return sanitize(this.get(attr)).xss();
    }

}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    /**
     * Returns an array of keys permitted in every method's `options` hash.
     * Can be overridden and added to by a model's `permittedOptions` method.
     * @return {Array} Keys allowed in the `options` hash of every model's method.
     */
    permittedOptions: function () {
        // terms to whitelist for all methods.
        return ['context', 'include', 'transacting'];
    },

    /**
     * A simple helper function to instantiate a new Model without needing new
     * @param data
     * @param options
     * @returns {Model}
     */
    forge: function (data, options) {
        var Self = this,
            newObj;
        // 没有uuid，为model instance补充
        if (!data.uuid) {
            data.uuid = uuid.v4();
        }

        newObj = new Self(data);
        newObj.options = options;

        return newObj;
    },


    /**
     * Filters potentially unsafe `options` in a model method's arguments, so you can pass them to Bookshelf / Knex.
     * @param {Object} options Represents options to filter in order to be passed to the Bookshelf query.
     * @param {String} methodName The name of the method to check valid options for.
     * @return {Object} The filtered results of `options`.
     */
    filterOptions: function (options, methodName) {
        var permittedOptions = this.permittedOptions(methodName);

        return _.pick(options, permittedOptions);
    },

    // ## Model Data Functions

    /**
     * ### Find All
     * Naive find all fetches all the data for a particular model
     * @param {Object} options (optional) mongoose options, not our options
     * @return {Promise} Collection of all Models
     */
    findAll:  function (options) {
        return this.findAsync({}, null, options);
    },

    /**
     * ### Generate Slug
     * Create a string to act as the permalink for an object.
     * @param {ghostBookshelf.Model} Model Model type to generate a slug for
     * @param {String} base The string for which to generate a slug, usually a title or name
     * @param {Object} options Options to pass to findOne
     * @return {Promise(String)} Resolves to a unique slug string
     */
    generateSlug: function (Model, base, options) {
        var slug,
            slugTryCount = 1,
            baseName = Model.schema.collectionName.replace(/s$/, ''),
        // Look for a matching slug, append an incrementing number if so
            checkIfSlugExists, longSlug;

        checkIfSlugExists = function (slugToFind) {
            var args = {slug: slugToFind};
            // status is needed for posts
            if (options && options.status) {
                args.status = options.status;
            }
            return Model.findOneAsync(args, options).then(function (found) {
                var trimSpace;

                if (!found) {
                    return slugToFind;
                }

                slugTryCount += 1;

                // If we shortened, go back to the full version and try again
                if (slugTryCount === 2 && longSlug) {
                    slugToFind = longSlug;
                    longSlug = null;
                    slugTryCount = 1;
                    return checkIfSlugExists(slugToFind);
                }

                // If this is the first time through, add the hyphen
                if (slugTryCount === 2) {
                    slugToFind += '-';
                } else {
                    // Otherwise, trim the number off the end
                    trimSpace = -(String(slugTryCount - 1).length);
                    slugToFind = slugToFind.slice(0, trimSpace);
                }

                slugToFind += slugTryCount;

                return checkIfSlugExists(slugToFind);
            });
        };

        slug = utils.safeString(base);

        // Remove trailing hyphen
        slug = slug.charAt(slug.length - 1) === '-' ? slug.substr(0, slug.length - 1) : slug;

        // If it's a user, let's try to cut it down (unless this is a human request)
        if (baseName === 'user' && options && options.shortSlug && slugTryCount === 1 && slug !== 'admin') {
            longSlug = slug;
            slug = (slug.indexOf('-') > -1) ? slug.substr(0, slug.indexOf('-')) : slug;
        }

        // Check the filtered slug doesn't match any of the reserved keywords
        return filters.doFilter('slug.reservedSlugs', config.slugs.reserved).then(function (slugList) {
            // Some keywords cannot be changed
            slugList = _.union(slugList, config.slugs.protected);

            return _.contains(slugList, slug) ? slug + '-' + baseName : slug;
        }).then(function (slug) {
            // if slug is empty after trimming use the model name
            if (!slug) {
                slug = baseName;
            }
            // Test for duplicate slugs.
            return checkIfSlugExists(slug);
        });
    }

}, {
    // ### Schema Level Methods

    // This method registers hooks, should not invoked by developers
    // icollege shelf will automatically invoke it.
    // This 'this' is Schema Object
    initialize: function () {
        //hook这里，只有init save validate这几个是可用的
        this.pre('validate', this.saving);
    },


    // This 'this' is Model Instance Object
    saving: function (next) {
        if (!this.get('created_by')) {
            this.set('created_by', this.contextUser(this.options));
        }
        this.set('updated_by', this.contextUser(this.options));
        this.set('updated_at', new Date());
        next();
    }
});


module.exports = icollegeShelf;
