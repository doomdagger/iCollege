var moment  = require('moment'),
    path    = require('path'),
    when    = require('when'),
    baseStore;


function BaseStore (){ }

/**
 * @param {String} baseDir - base directory
 * @returns {String}
 */
BaseStore.prototype.getTargetDir = function (baseDir) {
    var m = moment(new Date().getTime()),
        month = m.format('MMM'),
        year =  m.format('YYYY');

    if (baseDir) {
        return path.join(baseDir, year, month);
    }

    return path.join(year, month);
};


BaseStore.prototype.generateUnique = function (store, dir, name, ext, i, done) {
    var self = this,
        filename,
        append = '';

    if (i) {
        append = '-' + i;
    }

    filename = path.join(dir, name + append + ext);

    store.exists(filename).then(function (exists) {
        if (exists) {
            setImmediate(function () {
                i = i + 1;
                self.generateUnique(store, dir, name, ext, i, done);
            });
        } else {
            done.resolve(filename);
        }
    });
};

BaseStore.prototype.getUniqueFileName = function (store, image, targetDir) {
    var done = when.defer(),
        ext = path.extname(image.name),
        name = path.basename(image.name, ext).replace(/[\W]/gi, '-');

    this.generateUnique(store, targetDir, name, ext, 0, done);

    return done.promise;
};


baseStore = new BaseStore;

module.exports = baseStore;
//module.exports.BaseStore = BaseStore;