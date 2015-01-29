// # API routes
var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function (middleware) {
    var router = express.Router();
    // alias delete with del
    router.del = router.delete;

    // ## Configuration
    router.get('/configuration', api.http(api.configuration.browse));
    router.get('/configuration/:key', api.http(api.configuration.read));

    // ## Settings
    router.get('/settings', api.http(api.settings.browse));
    router.get('/settings/:key', api.http(api.settings.read));
    router.put('/settings', api.http(api.settings.edit));

    // ## Roles
    router.get('/roles/', api.http(api.roles.browse));

    // ## DB
    router.get('/db', api.http(api.db.exportContent));
    router.post('/db', middleware.busboy, api.http(api.db.importContent));
    router.del('/db', api.http(api.db.deleteAllContent));

    // ## Mail
    router.post('/mail', api.http(api.mail.send));
    router.post('/mail/test', function (req, res) {
        api.http(api.mail.sendTest)(req, res);
    });

    // ## Authentication
    router.post('/authentication/passwordreset',
        middleware.spamForgottenPrevention,
        api.http(api.authentication.generateResetToken)
    );
    router.put('/authentication/passwordreset', api.http(api.authentication.resetPassword));
    router.post('/authentication/invitation', api.http(api.authentication.acceptInvitation));
    router.get('/authentication/invitation', api.http(api.authentication.isInvitation));
    router.post('/authentication/setup', api.http(api.authentication.setup));
    router.get('/authentication/setup', api.http(api.authentication.isSetup));
    router.post('/authentication/token',
        middleware.spamSigninPrevention,
        middleware.addClientSecret,
        middleware.authenticateClient,
        middleware.generateAccessToken
    );
    router.post('/authentication/revoke', api.http(api.authentication.revoke));

    // ## Uploads
    router.post('/uploads', middleware.busboy, api.http(api.uploads.add));

    return router;
};

module.exports = apiRoutes;
