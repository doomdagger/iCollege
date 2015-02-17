// # User Model

var icollegeShelf = require('./base'),
    User,
    Users;

Users = icollegeShelf.schema('users', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

User = icollegeShelf.model('User', Users);


module.exports = {
    User: User,
    Users: Users
};
