// # Message Model

var icollegeShelf = require('./base'),
    Message,
    Messages;

Messages = icollegeShelf.schema('messages', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Message = icollegeShelf.model('Message', Messages);


module.exports = {
    Message: Message,
    Messages: Messages
};
