var url             = require('url'),
    moment          = require('moment'),
    config          = require('../../server/config'),
    ApiRouteBase    = '/icollege/api/v0.1/',
    host            = config.server.host,
    port            = config.server.port,
    schema          = 'http://',
    expectedProperties = {
        configuration: ['key', 'value'],
        roles: ['roles'],
        settings: ['settings', 'meta'],
        setting: ['_id', 'uuid', 'key', 'value', 'type', 'created_at', 'created_by', 'updated_at', 'updated_by'],
        slugs: ['slugs'],
        slug: ['slug'],
        accesstoken: ['access_token', 'refresh_token', 'expires_in', 'token_type'],
        role: ['_id', 'uuid', 'name', 'description', 'created_at', 'created_by', 'updated_at', 'updated_by', 'permissions'],
        user: ['_id',  'updated_by', 'created_by', 'slug', 'name', 'nickname', 'email', 'uuid', 'apps', 'permissions',
            'roles', 'friends', 'circles', 'groups', 'updated_at', 'created_at', 'settings', 'login_status', 'status',
            'tags', 'location', 'website', 'birth_date', 'gender', 'signature', 'bio', 'credit'
        ],
        users: ['users', 'meta']
    };

function getApiQuery(route) {
    return url.resolve(ApiRouteBase, route);
}

function getApiURL(route) {
    var baseURL = url.resolve(schema + host + ':' + port, ApiRouteBase);
    return url.resolve(baseURL, route);
}

// make sure the API only returns expected properties only
function checkResponseValue(jsonResponse, properties) {
    for (var i = 0; i < properties.length; i = i + 1) {
        // For some reason, settings response objects do not have the 'hasOwnProperty' method
        if (Object.prototype.hasOwnProperty.call(jsonResponse, properties[i])) {
            continue;
        }
        jsonResponse.should.have.property(properties[i]);
    }
    Object.keys(jsonResponse).length.should.eql(properties.length);
}

function checkResponse(jsonResponse, objectType, additionalProperties) {
    var checkProperties = expectedProperties[objectType];
    checkProperties = additionalProperties ? checkProperties.concat(additionalProperties) : checkProperties;

    checkResponseValue(jsonResponse, checkProperties);
}

function isISO8601(date) {
    return moment(date).parsingFlags().iso;
}

module.exports = {
    getApiURL: getApiURL,
    getApiQuery: getApiQuery,
    checkResponse: checkResponse,
    checkResponseValue: checkResponseValue,
    isISO8601: isISO8601
};
