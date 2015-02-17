// # Role Model

var icollegeShelf = require('./base'),
    Role,
    Roles;

Roles = icollegeShelf.schema('roles', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Role = icollegeShelf.model('Role', Roles);


module.exports = {
    Role: Role,
    Roles: Roles
};
