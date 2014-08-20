/**
 * ## Refresh Token Model
 * Created by Li He on 2014/7/23.
 */
var //when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Refreshtoken,
    Refreshtokens;

// ## Schema definition
Refreshtokens = icollegeSchema.extend("refreshtokens", {
    // ### statics
    destroyAllExpired:  function () {
        return this.removePromised({expires: {$lt: Date.now()}});
    }

}, {
    // ### methods


}, [
    // add plugins for Apps schema

]);




// Model definition
Refreshtoken = mongoose.model('Refreshtoken', Refreshtokens);


module.exports = {
    Refreshtoken: Refreshtoken,
    Refreshtokens: Refreshtokens
};
