// # ICollege Data API
// Provides access from anywhere to the ICollege data layer.
//
// ICollege's JSON API is integral to the workings of ICollege, regardless of whether you want to access data internally,
// from a theme, an app, or from an external app, you'll use the ICollege JSON API to do so.

var _             = require('lodash'),
    when          = require('when'),
    config        = require('../config'),

    // Include Endpoints
    users         = require('./users'),
    db            = require('./db'),
    settings      = require('./settings'),
    mail          = require('./mail'),

    http,
    formatHttpErrors,
    cacheInvalidationHeader,
    locationHeader,
    contentDispositionHeader,
    init;

/**
 * ### Init
 * Initialise the API - populate the settings cache
 * @return {Promise} Resolves to Settings Collection
 */
init = function () {
    return settings.updateSettingsCache();
};



/**
 * ### Cache Invalidation Header
 * Calculate the header string for the X-Cache-Invalidate: header.
 * The resulting string instructs any cache in front of the blog that request has occurred
 * which invalidates any cached versions of the listed URIs.
 *
 * `/*` is used to mean the entire cache is invalid
 *
 * 该方法主要是用来处理post被更新时头部信息的cache状态，icollege用此方法来处理post与repost的cache问题
 *
 * @private
 * @param {express.request} req Original HTTP Request
 * @param {Object} result API method result
 * @return {String} Resolves to header string
 */
cacheInvalidationHeader = function (req, result) {
    // make the url into array, like ['','api','v0.1','users','id']
    var parsedUrl = req._parsedUrl.pathname.replace(/\/$/, '').split('/'),
        method = req.method,
        endpoint = parsedUrl[3],// endpoint, like users, groups, posts, etc. just like modules
        id = parsedUrl[4], //id or any other important unique flag
        cacheInvalidate,
        jsonResult = result.toJSON ? result.toJSON() : result,
        post,
        hasStatusChanged,
        wasDeleted,
        wasPublishedUpdated;

    //console.log(require('util').inspect(parsedUrl));

    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        if (endpoint === 'settings' || endpoint === 'users' || endpoint === 'db') {
            // 如果是这些endpoint，作废全部的cache
            cacheInvalidate = '/*';
        } else if (endpoint === 'posts') {
            // 如果是posts
            post = jsonResult.posts[0];
            hasStatusChanged = post.statusChanged;
            wasDeleted = method === 'DELETE';
            // Invalidate cache when post was updated but not when post is draft
            wasPublishedUpdated = method === 'PUT' && post.status === 'published';

            // Remove the statusChanged value from the response
            delete post.statusChanged;

            // Don't set x-cache-invalidate header for drafts
            if (hasStatusChanged || wasDeleted || wasPublishedUpdated) {
                cacheInvalidate = '/, /page/*, /rss/, /rss/*, /tag/*';
                if (id && post.slug) {
                    return config.urlForPost(settings, post).then(function (postUrl) {
                        return cacheInvalidate + ', ' + postUrl;
                    });
                }
            }
        }
    }

    return when(cacheInvalidate);
};

/**
 * ### Location Header
 *
 * If the API request results in the creation of a new object, construct a Location: header which points to the new
 * resource.
 *
 * 每当进行post请求时，设置location头部信息，以便进行跳转，如有必要！
 *
 * @private
 * @param {express.request} req Original HTTP Request
 * @param {Object} result API method result
 * @return {String} Resolves to header string
 */
locationHeader = function (req, result) {
    var apiRoot = config.urlFor('api'),
        location,
        post,
        notification,
        parsedUrl = req._parsedUrl.pathname.replace(/\/$/, '').split('/'),
        endpoint = parsedUrl[4];

    if (req.method === 'POST') {
        if (result.hasOwnProperty('posts')) {
            post = result.posts[0];
            location = apiRoot + '/posts/' + post.id + '/?status=' + post.status;
        } else if (endpoint === 'notifications') {
            notification = result.notifications;
            location = apiRoot + '/notifications/' + notification[0].id;
        }
    }

    return when(location);
};

/**
 * ### Content Disposition Header
 * create a header that invokes the 'Save As' dialog in the browser when exporting the database to file. The 'filename'
 * parameter is governed by [RFC6266](http://tools.ietf.org/html/rfc6266#section-4.3).
 *
 * For encoding whitespace and non-ISO-8859-1 characters, you MUST use the "filename*=" attribute, NOT "filename=".
 * Ideally, both. Examples: http://tools.ietf.org/html/rfc6266#section-5
 *
 * We'll use ISO-8859-1 characters here to keep it simple.
 *
 * @private
 * @see http://tools.ietf.org/html/rfc598
 * @return {string}
 */
contentDispositionHeader = function () {
    // replace ':' with '_' for OS that don't support it
    var now = (new Date()).toJSON().replace(/:/g, '_');
    return 'Attachment; filename="icollege-' + now + '.json"';
};


/**
 * ### Format HTTP Errors
 * Converts the error response from the API into a format which can be returned over HTTP
 *
 * @private
 * @param {Array} error
 * @return {{errors: Array, statusCode: number}}
 */
formatHttpErrors = function (error) {
    var statusCode = 500,
        errors = [];

    if (!_.isArray(error)) {
        error = [].concat(error);
    }

    _.each(error, function (errorItem) {
        var errorContent = {};

        //TODO: add logic to set the correct status code
        statusCode = errorItem.code || 500;

        errorContent.message = _.isString(errorItem) ? errorItem :
            (_.isObject(errorItem) ? errorItem.message : 'Unknown API Error');
        errorContent.type = errorItem.type || 'InternalServerError';
        errors.push(errorContent);
    });

    return {errors: errors, statusCode: statusCode};
};

/**
 * ### HTTP
 *
 * Decorator for API functions which are called via an HTTP request. Takes the API method and wraps it so that it gets
 * data from the request and returns a sensible JSON response.
 *
 * @public
 * @param {Function} apiMethod API method to call
 * @return {Function} middleware format function to be called by the route when a matching request is made
 */
http = function (apiMethod) {

    return function (req, res) {
        // We define 2 properties for using as arguments in API calls:
        var object = req.body,
            options = _.extend({}, req.files, req.query, req.params, {
                context: {
                    // TODO: user id should be in req.query
                    user: (req.session && req.session.user) ? req.session.user : null
                    // TODO: add app context someday
                }
            });

        // If this is a GET, or a DELETE, req.body should be null, so we only have options (route and query params)
        // If this is a PUT, POST, or PATCH, req.body is an object
        if (_.isEmpty(object)) {
            object = options;
            options = {};
        }

        return apiMethod(object, options)
            // Handle adding headers
            .then(function onSuccess(result) {
                // Add X-Cache-Invalidate header
                return cacheInvalidationHeader(req, result)
                    .then(function addCacheHeader(header) {
                        if (header) {
                            res.set({'X-Cache-Invalidate': header});
                        }

                        // Add Location header
                        return locationHeader(req, result);
                    }).then(function addLocationHeader(header) {
                        if (header) {
                            res.set({'Location': header});
                            // The location header indicates that a new object was created.
                            // In this case the status code should be 201 Created
                            res.status(201);
                        }

                        // Add Content-Disposition Header
                        if (apiMethod === db.exportContent) {
                            res.set({
                                'Content-Disposition': contentDispositionHeader()
                            });
                        }

                        // #### Success
                        // Send a properly formatting HTTP response containing the data with correct headers
                        res.json(result || {});
                    });
            }).catch(function onError(error) {
                // #### Error
                var httpErrors = formatHttpErrors(error);
                // Send a properly formatted HTTP response containing the errors
                res.json(httpErrors.statusCode, {success: false, errors: httpErrors.errors});
            });
    };
};


/**
 * ## Public API
 */
module.exports = {
    // Extras
    init: init,
    http: http,
    // API Endpoints
    users: users,
    db: db,
    mail: mail
};

/**
 * ## API Methods
 *
 * Most API methods follow the BREAD pattern, although not all BREAD methods are available for all resources.
 * Most API methods have a similar signature, they either take just `options`, or both `object` and `options`.
 * For RESTful resources `object` is always a model object of the correct type in the form `name: [{object}]`
 * `options` is an object with several named properties, the possibilities are listed for each method.
 *
 * Read / Edit / Destroy routes expect some sort of identifier (id / slug / key) for which object they are handling
 *
 * All API methods take a context object as one of the options:
 *
 * @typedef context
 * Context provides information for determining permissions. Usually a user, but sometimes an app, or the internal flag
 * @param {Number} user (optional)
 * @param {String} app (optional)
 * @param {Boolean} internal (optional)
 */
