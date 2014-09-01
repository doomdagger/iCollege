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
    router.get('/users/', middleware.busboy, api.http(api.users.browse));
    //router.get('/api/v0.1/users/:id/', middleware.test, api.http(api.users.read));
    router.get('/db/exportContent/', api.http(api.db.exportContent));


    // ## Authentication
    router.post('/authentication/passwordreset',
        middleware.spamForgottenPrevention,
        api.http(api.authentication.generateResetToken)
    );
    router.put('/authentication/passwordreset', api.http(api.authentication.resetPassword));
    router.post('/authentication/invitation', api.http(api.authentication.acceptInvitation));
    router.post('/authentication/setup', api.http(api.authentication.setup));
    router.get('/authentication/setup', api.http(api.authentication.isSetup));
    router.post('/authentication/token',
        middleware.spamSigninPrevention,
        middleware.addClientSecret,
        middleware.authenticateClient,
        middleware.generateAccessToken
    );

    // ## Uploads
    router.post('/uploads', middleware.busboy, api.http(api.uploads.add));


    return router;
};

module.exports = apiRoutes;
