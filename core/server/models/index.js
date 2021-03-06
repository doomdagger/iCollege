// # Model index file

var _       = require('lodash'),
    Promise = require('bluebird'),
    requireTree   = require('../require-tree'),
    models;

models = {
    excludeFiles: ['icollege-model.js', 'basetoken.js', 'base.js', 'index.js'],

    // ### init
    // Scan all files in this directory and then require each one and cache
    // the objects exported onto this `models` object so that every other
    // module can safely access models without fear of introducing circular
    // dependency issues.
    // @returns {Promise}
    init: function () {
        var self = this;

        // One off inclusion of Base file.
        self.Base = require('./base');

        // Require all files in this directory
        return requireTree.readAll(__dirname, {followSymlinks: false}).then(function (modelFiles) {
            // For each found file, excluding those we don't want,
            // we will require it and cache it here.
            _.each(modelFiles, function (path, fileName) {
                // Return early if this fileName is one of the ones we want
                // to exclude.
                if (_.contains(self.excludeFiles, fileName) || !_.isString(path)) {
                    return;
                }

                // Require the file.
                var file = require(path);

                // Cache its `export` object onto this object.
                _.extend(self, file);
            });

            return;
        });
    },
    // ### deleteAllContent
    // Delete all content(only content, not all the data from database) from the database (posts, tags, tags_posts)
    deleteAllContent: function () {
        var self = this;

        return self.Post.findAll().then(function (posts) {
            return Promise.all(_.map(posts, function (post) {
                return self.Post.destroy({_id: post._id});
            }));
        }).then(function () {
            return self.Message.findAll().then(function (messages) {
                return Promise.all(_.map(messages, function (message) {
                    return self.Message.destroy({_id: message._id});
                }));
            });
        });
    }
};

module.exports = models;
