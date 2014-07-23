var user       = require('../controllers/user'),
    config      = require('../config'),
    express     = require('express'),

    ONE_HOUR_S  = 60 * 60,
    ONE_YEAR_S  = 365 * 24 * ONE_HOUR_S,

    userRoutes;

userRoutes = function (middleware) {
    var router = express.Router(),
        subdir = config().paths.subdir;


    router.get('/index', user.index);

    router.get('/good', middleware.busboy, function redirect(req, res) {
        res.set({'Cache-Control': 'public, max-age=' + ONE_YEAR_S});
        res.redirect(301, subdir + '/index');
    });


    return router;
};

module.exports = userRoutes;