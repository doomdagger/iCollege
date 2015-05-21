// # iCollege Configuration
// Setup your iCollege install for various environments

var path = require('path'),
    config;


config = {
    // ### Production
    // When running Ghost in the wild, use the production environment
    // Configure your URL and mail settings here
    production: {
        url: 'http://icollege.com',
        mail: {},
        database: {
            // our main database, storage for all important data
            mongodb: {
                connection: {
                    host: '127.0.0.1',
                    port: '27017',
                    database: 'icollege'
                }
            },
            // our big file serialization database, storage for all assets
            sqlite3: {
                connection: {
                    filename: path.join(__dirname, '/content/data/icollege-dev.db')
                },
                debug: false
            },
            // storage for session and other caches
            redis: {
                connection: {
                    host: '127.0.0.1',
                    port: '6379',
                    db: 'icollege'
                },
                options: {
                    return_buffers: false,
                    detect_buffers: false
                }
            }
        },

        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
            port: '1222'
        }
    },

    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site, E.g. in RSS and email.
        url: 'http://localhost:1222',

        //  Mail config
        mail: {
            transport: 'SMTP',
            options: {
                service: 'gmail',
                auth: {
                    user: 'icollegeplatform@gmail.com', // gmail username
                    pass: 'mroftalpegelloci'            // gmail password
                }
            },
            mailfrom: 'icollegeplatform@gmail.com', // mail from address, QQ service demand this value to be same with auth.user
            mailto: 'icollegeplatform@gmail.com'  // test mail address, only for development
        },

        // database configs
        database: {
            // our main database, storage for all important data
            mongodb: {
                connection: {
                    host: '127.0.0.1',
                    port: '27017',
                    database: 'icollege'
                },
                options: {
                    db: {
                        ative_parser: true
                    },
                    server: {
                        poolSize: 5
                    }
                }
            },
            // our big file serialization database, storage for all assets
            sqlite3: {
                connection: {
                    filename: path.join(__dirname, '/content/data/icollege-dev.db')
                },
                debug: false
            },
            // storage for session and other caches
            redis: {
                connection: {
                    host: '127.0.0.1',
                    port: '6379',
                    db: 'icollege'
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
        // paths config
        paths: {
            contentPath: path.join(__dirname, '/content/')
        },
        // api config, default version for the system
        api: {
            version: "0.1"
        },
        // logging level
        logging: true

    },

    // ### Testing
    // Used when developing Ghost to run tests and check the health of Ghost
    // Uses a different port number
    testing: {
        url: 'http://127.0.0.1:1222',
        // urlSSL: 'https://127.0.0.1:1443',
        database: {
            // our main database, storage for all important data
            mongodb: {
                connection: {
                    host: '127.0.0.1',
                    port: '27017',
                    database: 'icollege-test'
                }
            },
            // our big file serialization database, storage for all assets
            sqlite3: {
                connection: {
                    filename: path.join(__dirname, '/content/data/icollege-test.db')
                },
                debug: false
            },
            // storage for session and other caches
            redis: {
                connection: {
                    host: '127.0.0.1',
                    port: '6379',
                    db: 'icollege-test'
                }
            }
        },
        server: {
            host: '127.0.0.1',
            port: '1222'
        },
        // api config, default version for the system
        api: {
            version: "0.1"
        },
        logging: false
    }
};

// Export config
module.exports = config;