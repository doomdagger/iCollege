/**
 * ## Client Model
 * Created by Li He on 2014/7/23.
 */
var //when    = require('when'),
    mongoose = require('mongoose'),
    icollegeSchema = require('./base'),

    Client,
    Clients;

// ## Schema definition
Clients = icollegeSchema.extend("clients", {
    // ### statics


}, {
    // ### methods


}, [
    // add plugins for Apps schema

]);




// Model definition
Client = mongoose.model('Client', Clients);


module.exports = {
    Client: Client,
    Clients: Clients
};
