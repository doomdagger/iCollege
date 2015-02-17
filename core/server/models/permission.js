// # Permission Model

var icollegeShelf = require('./base'),
    Permission,
    Permissions;

Permissions = icollegeShelf.schema('permissions', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Permission = icollegeShelf.model('Permission', Permissions);


module.exports = {
    Permission: Permission,
    Permissions: Permissions
};
