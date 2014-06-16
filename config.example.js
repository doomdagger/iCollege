// # iCollege Configuration
// Setup your iCollege install for various environments

var path = require('path'),
    config;


config = {
    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site, E.g. in RSS and email.
        url: 'http://icollege.com',
        // Mail config
        mail: {
            transport: 'SMTP',
            options: {
                service: 'gmail',
                auth: {
                    user: '',
                    pass: ''
                }
            }
        },
        // database configs
        database: {
            // our main database, storage for all important data
            mongodb: {
                connection: {
                    host: '',
                    user: '',
                    password: '',
                    database: '',
                    charset: ''
                }
            },
            // our big file serialization database, storage for all assets
            sqlite3: {
                connection: {
                    filename: path.join(__dirname, '/content/data/ghost-dev.db')
                },
                debug: false
            },
            // storage for session and other caches
            redis: {
                connection: {
                    host: '',
                    port: ''
                },
                options: {
                    return_buffers: false,
                    detect_buffers: false
                }
            }
        },
        // server config
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
            port: '1222'
        },

        paths: {
            contentPath: path.join(__dirname, '/content/')
        }

    }
};

// Export config
module.exports = config;