// # API routes
var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function (/*middleware*/) {
    var router = express.Router();
    // alias delete with del
    router.del = router.delete;

    // routes add here

    return router;
};

module.exports = apiRoutes;
