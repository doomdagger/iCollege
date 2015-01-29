var api          = require('./api'),
    config       = require('../config');

module.exports = {
    apiBaseUri: '/icollege/api/v' + config.api.version + '/',
    api: api
};