var db = {
    users: {
        name: {type: String, default: "Li He", required: true},
        password: {type: String, default: "12345", required: true},
        email: {type: String, required: false}
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
