// # API routes
var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function (middleware) {
    var router = express.Router();

    // ## Users
    // must add trailing slash for each route
    router.get('/api/v0.1/users/', api.http(api.users.browse));
    //router.get('/api/v0.1/users/:id/', middleware.test, api.http(api.users.read));

    return router;
};

module.exports = apiRoutes;
