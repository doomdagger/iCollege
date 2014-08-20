/**
 * ## Access Token Model
 * Created by Li He on 2014/7/23.
 */
var //when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Accesstoken,
    Accesstokens;

// ## Schema definition
Accesstokens = icollegeSchema.extend("accesstokens", {
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
Accesstoken = mongoose.model('Accesstoken', Accesstokens);


module.exports = {
    Accesstoken: Accesstoken,
    Accesstokens: Accesstokens
};
