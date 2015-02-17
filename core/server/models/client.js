// # Client Model

var icollegeShelf = require('./base'),
    Client,
    Clients;

Clients = icollegeShelf.schema('clients', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Client = icollegeShelf.model('Client', Clients);


module.exports = {
    Client: Client,
    Clients: Clients
};
