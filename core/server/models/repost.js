// # Repost Model

var icollegeShelf = require('./base'),
    Repost,
    Reposts;

Reposts = icollegeShelf.schema('reposts', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Repost = icollegeShelf.model('Repost', Reposts);


module.exports = {
    Repost: Repost,
    Reposts: Reposts
};
