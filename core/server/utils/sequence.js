// # Bluebird extension
// Bluebird does not have function sequencing promise

var Promise = require('bluebird');

function sequence(tasks) {
    return Promise.reduce(tasks, function (results, task) {
        return task().then(function (result) {
            results.push(result);

            return results;
        });
    }, []);
}

module.exports = sequence;
