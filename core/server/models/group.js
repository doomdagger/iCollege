// # Group Model

var icollegeShelf = require('./base'),
    Group,
    Groups;

Groups = icollegeShelf.schema('groups', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Group = icollegeShelf.model('Group', Groups);


module.exports = {
    Group: Group,
    Groups: Groups
};
