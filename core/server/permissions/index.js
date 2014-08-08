// canThis(someUser).edit.post([id]|[[ids]], 'me')
// canThis(someUser).browse.post(somePost|somePostId, 'related')

var _                   = require('lodash'),
    when                = require('when'),
    Models              = require('../models'),
    objectTypeModelMap  = require('./objectTypeModelMap'),
    effectivePerms      = require('./effective'),
    PermissionsProvider = Models.Permission,
    init,
    refresh,
    canThis,
    CanThisResult,
    exported;

/**
 * Test if we already have a valid action map
 * @returns {*}
 */
function hasActionsMap() {
    // Just need to find one key in the actionsMap

    return _.any(exported.actionsMap, function (val, key) {
        /*jslint unparam:true*/
        return Object.hasOwnProperty.call(exported.actionsMap, key);
    });
}

/**
 * Context has two scope:
 * user and app
 * if it is an user-emitted request, context.user has user id
 * if it is an app-emitted request, context.app has app id
 * if it is an internal request and also owns an pre-context - user or app, we assign the context.internal with value 'true'
 * @param context
 * @returns {{internal: boolean, user: null, app: null}}
 */
function parseContext(context) {
    // Parse what's passed to canThis.beginCheck for standard user and app scopes
    var parsed = {
            internal: false,
            user: null,
            app: null
        };

    if (context && (context === 'internal' || context.internal)) {
        parsed.internal = true;
    }

    if (context && context.user) {
        parsed.user = context.user;
    }

    if (context && context.app) {
        parsed.app = context.app;
    }

    return parsed;
}

// Base class for canThis call results
CanThisResult = function () {

};

CanThisResult.prototype.buildObjectTypeHandlers = function (obj_types, act_type, context, permissionLoad) {
    // Iterate through the object types, i.e. ['post', 'tag', 'user']
    return _.reduce(obj_types, function (obj_type_handlers, obj_type) {
        // Grab the TargetModel through the objectTypeModelMap
        var TargetModel = objectTypeModelMap[obj_type];

        // Create the 'handler' for the object type;
        // the '.post()' in canThis(user).edit.post(modelOrId, scope)
        obj_type_handlers[obj_type] = function (modelOrId, scope) {
            var model;

            // If it's an internal request, resolve immediately
            if (context.internal) {
                return when.resolve();
            }

            // check the validity of scope
            if (!_.contains(['all', 'related', 'me'], scope)) {
                // if given and invalid, reject it!
                if (scope) {
                    return when.reject("Invalid Named Scope: " + scope);
                } else {
                    // default to `all`
                    scope = 'all';
                }
            }

            if (_.isNumber(modelOrId) || _.isString(modelOrId)) {
                // It's an id, query the model
                model = TargetModel.findByIdPromised(modelOrId);
            } else if (modelOrId) {
                // It's a model, assign the model
                model = when.resolve(modelOrId);
            } else {
                model = when.resolve(null);
            }
            // Wait for the user loading to finish
            // Permission check in here! Core Logic
            return when.all([permissionLoad, model]).then(function (result) {
                // Iterate through the user permissions looking for an affirmation
                var loadedPermissions = result[0],
                    foundModel = result[1],   // maybe null
                    userPermissions = loadedPermissions.user,
                    appPermissions = loadedPermissions.app,
                    hasUserPermission,
                    hasAppPermission,
                    deepReferProp = function (field_value, part) {
                        return field_value[part];
                    },
                    checkRelatedPerm = function (fields, values) {
                        var specValue,
                            i;

                        // length not match, bad params!
                        if (fields.length !== values.length) {
                            return false;
                        }

                        // we need validate all the fields
                        for (i in fields) {
                            if (fields.hasOwnProperty(i)) {
                                // 在foundUser中找到深层字段的具体值与object_value相比较，有一个不同，则该perm与验证的perm不为同一个
                                // return false directly
                                specValue = _.reduce(fields[i].split(/\./), deepReferProp, foundModel);

                                if (values[i] !== specValue.toString()) {
                                    return false;
                                }
                            }
                        }
                        // all pass, return true
                        return true;
                    },
                    checkPermission = function (permissions) {
                        var index,
                            perm,
                            ret;

                        for (index in permissions) {
                            if (permissions.hasOwnProperty(index)) {
                                perm = permissions[index];

                                // Look for a matching action type and object type first
                                if (perm.action_type !== act_type || perm.object_type !== obj_type || perm.permission_scope !== scope) {
                                    continue;
                                }
                                // If action_type, object_type, scope all match,
                                // check permission according to different scope

                                // `related` need `foundModel` to be not null!!
                                if (scope === "related" && foundModel) {
                                    // we need a closure to wrap the logic for validating fields and values pair
                                    ret = checkRelatedPerm(perm.object_fields, perm.object_values);

                                    if (ret) {
                                        return true;
                                    }
                                }
                                // `me` scope, need context.user and foundModel
                                else if (scope === "me" && context && context.user && foundModel) {
                                    // scope of me: one field only, with no other values to refer
                                    return foundModel[perm.object_fields[0]].toString() === context.user;
                                }
                                // `all` scope, need no specific fields, pass nothing to this method
                                else if (scope === "all") {
                                    return true;
                                }
                            }
                        }

                        return false;
                    };

                // Check user permissions for matching action, object and id.
                if (!_.isEmpty(userPermissions)) {
                    hasUserPermission = checkPermission(userPermissions);
                }

                // Check app permissions if they were passed
                hasAppPermission = true;
                if (!_.isNull(appPermissions)) {
                    hasAppPermission = checkPermission(appPermissions);
                }

                // Offer a chance for the TargetModel to override the results
                if (TargetModel && _.isFunction(TargetModel.permissable)) {
                    return TargetModel.permissable(foundModel, context, loadedPermissions, hasUserPermission, hasAppPermission);
                }

                if (hasUserPermission && hasAppPermission) {
                    return when.resolve(foundModel);
                }
                return when.reject();
            });
        };

        return obj_type_handlers;
    }, {});
};

CanThisResult.prototype.beginCheck = function (context) {
    var self = this,
        userPermissionLoad,
        appPermissionLoad,
        permissionsLoad;

    // Get context.user and context.app
    context = parseContext(context);

    if (!hasActionsMap()) {
        throw new Error("No actions map found, please call permissions.init() before use.");
    }

    // Kick off loading of effective user permissions if necessary
    if (context.user) {
        // context.user contains user id ?
        userPermissionLoad = effectivePerms.user(context.user);
    } else {
        // Resolve null if no context.user to prevent db call
        userPermissionLoad = when.resolve(null);
    }


    // Kick off loading of effective app permissions if necessary
    if (context.app) {
        // context.app contains app id ?
        appPermissionLoad = effectivePerms.app(context.app);
    } else {
        // Resolve null if no context.app
        appPermissionLoad = when.resolve(null);
    }

    // Wait for both user and app permissions to load
    permissionsLoad = when.all([userPermissionLoad, appPermissionLoad]).then(function (result) {
        return {
            user: result[0], // contains user permissions or null
            app: result[1]   //  contains app permissions or null
        };
    });

    // Iterate through the actions and their related object types
    _.each(exported.actionsMap, function (obj_types, act_type) {
        // Build up the object type handlers;
        // the '.post()' parts in canThis(user).edit.post()
        var obj_type_handlers = self.buildObjectTypeHandlers(obj_types, act_type, context, permissionsLoad);

        // Define a property for the action on the result;
        // the '.edit' in canThis(user).edit.post()
        Object.defineProperty(self, act_type, {
            writable: false,
            enumerable: false,
            configurable: false,
            value: obj_type_handlers
        });
    });

    // Return this for chaining
    return this;
};

canThis = function (context) {
    var result = new CanThisResult();

    return result.beginCheck(context);
};

init = refresh = function () {
    // Load all the permissions
    return PermissionsProvider.findAllPromised("name object_type action_type").then(function (perms) {
        var seenActions = {};

        exported.actionsMap = {};

        // Build a hash map of the actions on objects, i.e
        /*
        {
            'edit': ['post', 'tag', 'user', 'page'],
            'delete': ['post', 'user'],
            'create': ['post', 'user', 'page']
        }
        */
        _.each(perms, function (perm) {
            var action_type = perm.action_type,
                object_type = perm.object_type;

            exported.actionsMap[action_type] = exported.actionsMap[action_type] || [];
            seenActions[action_type] = seenActions[action_type] || {};

            // Check if we've already seen this action -> object combo
            if (seenActions[action_type][object_type]) {
                return;
            }

            exported.actionsMap[action_type].push(object_type);
            seenActions[action_type][object_type] = true;
        });

        return when(exported.actionsMap);
    });
};

module.exports = exported = {
    init: init,
    refresh: refresh,
    canThis: canThis,
    actionsMap: {}
};
