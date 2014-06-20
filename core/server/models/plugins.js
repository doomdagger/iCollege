// plugins for mongoose

module.exports = {
    // add last modified field and middleware
    lastModifiedPlugin: function(schema, options) {
        schema.add({ lastMod: Date });

        schema.pre('save', function (next) {
            this.lastMod = new Date;
            next();
        });

        if (options && options.index) {
            schema.path('lastMod').index(options.index)
        }
    }

};