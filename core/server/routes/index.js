var frontend     = require('./frontend'),
    api          = require('./api'),
    config       = require('../config');

module.exports = {
    apiBaseUri: '/api/v' + config.api.version + '/',
    api: api,
    frontend: frontend
};