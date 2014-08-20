var frontend       = require('../controllers/frontend'),
    config      = require('../config'),
    express     = require('express'),

    ONE_HOUR_S  = 60 * 60,
    ONE_YEAR_S  = 365 * 24 * ONE_HOUR_S,

    frontendRoutes;

frontendRoutes = function (middleware) {
    var router = express.Router(),
        subdir = config.paths.subdir;


    router.get('/', frontend.index);

    router.get('/good', middleware.busboy, function redirect(req, res) {
        res.set({'Cache-Control': 'public, max-age=' + ONE_YEAR_S});
        res.redirect(301, subdir + '/');
    });

    return router;
};

module.exports = frontendRoutes;