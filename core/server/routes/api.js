// # API routes
var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function (middleware) {
    var router = express.Router();

    // ## Users
    router.get('/icollege/api/v0.1/users/', middleware.test, api.http(api.users.browse));
    //router.get('/icollege/api/v0.1/users/:id/', middleware.test, api.http(api.users.read));

    return router;
};

module.exports = apiRoutes;
