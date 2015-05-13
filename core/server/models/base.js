// # Base Shelf
// This is the object from which all other iCollege models extend. The Shelf Object provides
// several basic behaviours such as UUIDs, as well as a set of Data methods for accessing information from the database.
//
// The models are internal to iCollege, only the API and some internal functions such as migration and import/export
// accesses the models directly. All other parts of iCollege are only
// allowed to access data via the API.

var _          = require('lodash'),
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
icollegeShelf = new Shelf(true, {
    // #### Model Instance Level methods, Methods
    // Methods on Model Level means model instance can invoke

    // Get permitted attributes from server/data/schema.js, which is where the DB schema is defined
    permittedAttributes: function () {
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
            return config.adminId;
        } else {
            errors.logAndThrowError(new Error('missing context'));
        }
    },

    // format date before writing to DB, bools work
    format: function (attrs) {
        return this.fixDates(attrs);
    },

    // format data and bool when fetching from DB
    parse: function (attrs) {
        return this.fixBools(this.fixDates(attrs));
    },

    /**
     * I create this method for our own logic to be hooked in!
     * @returns {*}
     */
    jsonify: function () {
        return icollegeShelf.Model.prototype.toJSON.apply(this, arguments);
    },

    sanitize: function (attr) {
        return sanitize(this.get(attr)).xss();
    }

}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke

    /**
     * A simple helper function to instantiate a new Model without needing new
     * @param data
     * @param [options]
     * @returns {Model}
     */
    forge: function (data, options) {
        var inst,
            obj,
            ret;

        options = options || {};

        if (!data.uuid) {
            data.uuid = uuid.v4();
        }
        inst = Object.create(this.prototype);
        obj = this.call(inst, data);

        ret = (Object(obj) === obj ? obj : inst);
        ret.options = options;
        return ret;
    },

    /**
     * Returns an array of keys permitted in every method's `options` hash.
     * Can be overridden and added to by a model's `permittedOptions` method.
     * @return {Array} Keys allowed in the `options` hash of every model's method.
     */
    permittedOptions: function () {
        // terms to whitelist for all methods.
        return ['context', 'include'];
    },

    /**
     * Filters potentially unsafe model attributes, so you can pass them to Bookshelf / Knex.
     * @param {Object} data Has keys representing the model's attributes/fields in the database.
     * @return {Object} The filtered results of the passed in data, containing only what's allowed in the schema.
     */
    filterData: function (data) {
        var permittedAttributes = this.prototype.permittedAttributes();

        return _.pick(data, permittedAttributes);
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
     * @param {Object} [projection] string partitioned by space
     * @param {Object} [options] (optional) mongoose options
     * @return {Promise} Collection of all Models
     */
    findAll:  function (projection, options) {
        options = this.filterOptions(options, 'findAll');
        return this.findAsync({}, projection, options);
    },


    /**
     * ### Edit
     * Naive edit
     * @param {Object} data update criteria
     * @param {Object} options (optional) put id in options
     * @return {Promise} Edited Model
     */
    edit: function (data, options) {
        var id = options.id || options._id;
        data = this.filterData(data);
        options = this.filterOptions(options, 'edit');

        return this.findOneAsync({_id: id}).then(function (object) {
            if (object) {
                return object.set(data).saveAsync(options);
            }
        });
    },

    /**
     * ### Add
     * Naive add
     * @param {Object} data
     * @param {Object} options (optional)
     * @return {Promise} Newly Added Model
     */
    add: function (data, options) {
        data = this.filterData(data);
        options = this.filterOptions(options, 'add');
        return this.forge(data).saveAsync(options);
    },

    /**
     * ### Destroy
     * Naive destroy
     * @return {Promise} Empty Model
     */
    destroy: function (options) {
        var id = options.id || options._id;
        // options = this.filterOptions(options, 'destroy');
        return this.removeAsync({_id: id});
    },

    /**
     * ### Generate Slug
     * Create a string to act as the permalink for an object.
     * @param {Model} Model Model type to generate a slug for
     * @param {String} base The string for which to generate a slug, usually a title or name
     * @param {Object} options Options to pass to findOne
     * @return {Promise} Resolves to a unique slug string
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
            return Model.findOneAsync(args).then(function (found) {
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
        this.pre('save', this.saving);
        this.pre('update', this.updating);
    },

    // ## Model Instance Level Hookup
    // Document middleware is supported for the following document functions.
    // * [init](http://mongoosejs.com/docs/api.html#document_Document-init)
    // * [validate](http://mongoosejs.com/docs/api.html#document_Document-validate)
    // * [save](http://mongoosejs.com/docs/api.html#model_Model-save)
    // * [remove](http://mongoosejs.com/docs/api.html#model_Model-remove)
    // 'this' is Model Instance Object

    saving: function (next, options) {
        var id = this.contextUser(options);

        if (!this.get('created_by')) {
            this.set('created_by', id);
        }
        this.set('updated_by', id);
        this.set('updated_at', new Date());

        next(options);
    },

    // ## Model Level Hookup
    // Query middleware is supported for the following Model and Query functions.
    // * [count](http://mongoosejs.com/docs/api.html#query_Query-count)
    // * [find](http://mongoosejs.com/docs/api.html#query_Query-find)
    // * [findOne](http://mongoosejs.com/docs/api.html#query_Query-findOne)
    // * [update](http://mongoosejs.com/docs/api.html#query_Query-update)
    // 'this' is Model Object

    updating: function (next) {
        errors.logWarn("Using update method on collection: " + this.model.schema.collectionName + ", probably losing updated context!");
        next();
    }
});


module.exports = icollegeShelf;
