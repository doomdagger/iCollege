// plugins for mongoose

module.exports = {
    // add last modified field and middleware
    // Deprecated! we have updateAt and createdAt field with default value options!
    // there is no need to use this plugin
    'lastModifiedPlugin': function (schema, options) {
        schema.add({ lastMod: Date });

        schema.pre('save', function (next) {
            this.lastMod = new Date();
            next();
        });

        if (options && options.index) {
            schema.path('lastMod').index(options.index);
        }
    }

};