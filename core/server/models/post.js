// # Post Model

var icollegeShelf = require('./base'),
    Post,
    Posts;

Posts = icollegeShelf.schema('posts', {
    // #### Model Instance Level methods, Methods
    // Methods on Model Instance Level means model instance can invoke


}, {
    // #### Model Level methods, Statics
    // Methods on Model Level means Model Class can invoke


});

Post = icollegeShelf.model('Post', Posts);


module.exports = {
    Post: Post,
    Posts: Posts
};
