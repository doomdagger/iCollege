// # API routes
var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function (middleware) {
    var router = express.Router();
    // alias delete with del
    router.del = router.delete;

    // ## Users
    // must add trailing slash for each route
    router.get('/api/v0.1/users/', middleware.busboy, api.http(api.users.browse));
    //router.get('/api/v0.1/users/:id/', middleware.test, api.http(api.users.read));
    router.get('/api/v0.1/db/exportContent/', api.http(api.db.exportContent));

    return router;
};

module.exports = apiRoutes;
