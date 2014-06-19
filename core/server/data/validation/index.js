// Extend validator module
// also add more validators to the project
// developers are recommended to use this validation module,
// rather than the third-party validator module

var _         = require('lodash'),
    validator = require('validator'),
    when      = require('when'),
    errors    = require('../../errors'),

    validateSettings,
    validate;

// Provide a few custom validators
//
validator.extend('empty', function (str) {
    return _.isEmpty(str);
});

validator.extend('notContains', function (str, badString) {
    return !_.contains(str, badString);
});


// Validation for settings
// settings are checked against the validation objects
// form default-settings.json
validateSettings = function (defaultSettings, model) {
    var values = model.toJSON(),
        validationErrors = [],
        matchingDefault = defaultSettings[values.key];

    if (matchingDefault && matchingDefault.validations) {
        validationErrors = validationErrors.concat(validate(values.value, values.key, matchingDefault.validations));
    }

    if (validationErrors.length !== 0) {
        return when.reject(validationErrors);
    }
};

// Validate default settings using the validator module.
// Each validation's key is a method name and its value is an array of options
//
// eg:
//      validations: { isUrl: true, isLength: [20, 40] }
//
// will validate that a setting's length is a URL between 20 and 40 chars.
//
// If you pass a boolean as the value, it will specify the "good" result. By default
// the "good" result is assumed to be true.
//
// eg:
//      validations: { isNull: false }  // means the "good" result would
//                                      // fail the `isNull` check, so
//                                      // not null.
//
// available validators: https://github.com/chriso/validator.js#validators
validate = function (value, key, validations) {
    var validationErrors = [];
    _.each(validations, function (validationOptions, validationName) {
        var goodResult = true;

        if (_.isBoolean(validationOptions)) {
            goodResult = validationOptions;
            validationOptions = [];
        } else if (!_.isArray(validationOptions)) {
            validationOptions = [validationOptions];
        }

        validationOptions.unshift(value);

        // equivalent of validator.isSomething(option1, option2)
        if (validator[validationName].apply(validator, validationOptions) !== goodResult) {
            validationErrors.push(new errors.ValidationError('Settings validation (' + validationName + ') failed for ' + key, key));
        }

        validationOptions.shift();
    }, this);

    return validationErrors;
};

module.exports = validator;
module.exports.validateSettings = validateSettings;
