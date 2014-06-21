
var db = {
    users: {
        name: {type: String, default: "Li He", required: true},
        password: {type: String, default: "12345", required: true},
        // # display functions below
        status: {type: String, enum: ['online', 'offline', 'invalid'], lowercase: true},
        email: {type: String, match: /.*?@.*?/, trim: true},
        createAt: {type: Date, expires: 60 * 60 * 24}, // 24 hours
        age: {type: Number, min: 0, max: 150},
        tags: [{type: String}], // array
        address: {
            city: String,
            street: String
        }
    }
};

function isPost(jsonData) {
    return jsonData.hasOwnProperty('html') && jsonData.hasOwnProperty('markdown') &&
        jsonData.hasOwnProperty('title') && jsonData.hasOwnProperty('slug');
}

function isTag(jsonData) {
    return jsonData.hasOwnProperty('name') && jsonData.hasOwnProperty('slug')
        && jsonData.hasOwnProperty('description') && jsonData.hasOwnProperty('parent_id');
}

module.exports.collections = db;
module.exports.checks = {
    isPost: isPost,
    isTag: isTag
};
