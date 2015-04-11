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
            return 1;
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
    //generateSlug: function (Model, base, options) {
    //    //TODO: slug? we do need slug! Pending implementation.
    //}

}, {
    // ### Schema Level Methods

    // This method registers hooks, should not invoked by developers
    // icollege shelf will automatically invoke it.
    // This 'this' is Schema Object
    initialize: function () {
        //TODO create 挂上hook并不好使！！！如何解决
        //this.pre('init', this.creating);
        this.pre('save', this.saving);
    },

    // This 'this' is Model Object, pay attention!
    // TODO: 迫于mongoose的接受参数并没有options，我们把options放在Model instance的options字段
    // 我们的自定义options不等于mongoose有些函数需要传入的options，我们的options仅仅负责给中间件提供帮助
    creating: function (next, newObj) {
        if (!newObj.get('created_by')) {
            newObj.set('created_by', newObj.contextUser(newObj.options));
        }
        next(newObj);
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
