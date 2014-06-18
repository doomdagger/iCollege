var user       = require('../controllers/user'),
    config      = require('../config'),

    //ONE_HOUR_S  = 60 * 60,
    //ONE_YEAR_S  = 365 * 24 * ONE_HOUR_S,

    userRoutes;

userRoutes = function (server) {

    server.get('/index', user.index);

};

module.exports = userRoutes;