// # Task automation for iCollege
//
// Run various tasks when developing for and working with iCollege.
//
// **Usage instructions:** can be found in the [Custom Tasks](#custom%20tasks) section or by running `grunt --help`.
//
// **Debug tip:** If you have any problems with any Grunt tasks, try running them with the `--verbose` command
var _              = require('lodash'),
    colors         = require('colors'),
    fs             = require('fs-extra'),
    path           = require('path'),
    Promise        = require('bluebird'),
    request        = require('request'),

    escapeChar     = process.platform.match(/^win/) ? '^' : '\\',
    cwd            = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1'),


// ## List of files we want to lint through jshint and jscs to make sure
// they conform to our desired code styles.
    lintFiles = {
        // Linting files for server side or shared javascript code.
        server: {
            files: {
                src: [
                    '*.js',
                    '!config*.js', // note: i added this, do we want this linted?
                    'core/*.js',
                    'core/server/**/*.js'
                ]
            }
        },
        // Linting files for test code.
        test: {
            files: {
                src: [
                    'core/test/**/*.js'
                ]
            }
        }
    },

    // ## Grunt configuration
    configureGrunt = function (grunt) {
        // *This is not useful but required for jshint*
        colors.setTheme({silly: 'rainbow'});

        // #### Load all grunt tasks
        //
        // Find all of the task which start with `grunt-` and load them, rather than explicitly declaring them all
        require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

        var cfg = {
            // Standard build type, for when we have nightlies again.
            buildType: 'Build',
            // Load package.json so that we can create correctly versioned releases.
            pkg: grunt.file.readJSON('package.json'),

            // ### grunt-contrib-watch
            // Watch files and livereload in the browser during development.
            // See the [grunt dev](#live%20reload) task for how this is used.
            watch: {
                express: {
                    files:  ['core/server/*.js', 'core/server/**/*.js'],
                    tasks:  ['express:dev'],
                    options: {
                        // **Note:** Without this option specified express won't be reloaded
                        nospawn: true
                    }
                }
            },

            // ### grunt-express-server
            // Start a iCollege expess server for use in development and testing
            express: {
                options: {
                    script: 'index.js',
                    output: 'iCollege is running'
                },

                dev: {
                    options: {}
                },
                test: {
                    options: {
                        node_env: 'testing'
                    }
                }
            },

            // ### grunt-contrib-jshint
            // Linting rules, run as part of `grunt validate`. See [grunt validate](#validate) and its subtasks for
            // more information.
            jshint: (function () {
                return _.merge({
                    server: {
                        options: {
                            jshintrc: '.jshintrc'
                        }
                    },
                    test: {
                        options: {
                            jshintrc: 'core/test/.jshintrc'
                        }
                    }
                }, lintFiles);
            })(),

            // ### grunt-jscs
            // Code style rules, run as part of `grunt validate`. See [grunt validate](#validate) and its subtasks for
            // more information.
            jscs: (function () {
                return _.merge({
                    server: {
                        options: {
                            config: '.jscsrc'
                        }
                    },
                    test: {
                        options: {
                            config: '.jscsrc'
                        }
                    }
                }, lintFiles);
            })(),

            // ### grunt-mocha-cli
            // Configuration for the mocha test runner, used to run unit, integration and route tests as part of
            // `grunt validate`. See [grunt validate](#validate) and its sub tasks for more information.
            mochacli: {
                options: {
                    ui: 'bdd',
                    reporter: grunt.option('reporter') || 'spec',
                    timeout: '15000',
                    save: grunt.option('reporter-output')
                },

                // #### All Unit tests
                unit: {
                    src: [
                        'core/test/unit/**/*_spec.js'
                    ]
                },

                // ##### Groups of unit tests
                server: {
                    src: ['core/test/unit/**/server*_spec.js']
                },

                perm: {
                    src: ['core/test/unit/**/permissions_spec.js']
                },

                migrate: {
                    src: [
                        'core/test/unit/**/export_spec.js',
                        'core/test/unit/**/import_spec.js'
                    ]
                },

                storage: {
                    src: ['core/test/unit/**/storage*_spec.js']
                },

                // #### All Integration tests
                integration: {
                    src: [
                        'core/test/integration/**/model*_spec.js',
                        'core/test/integration/**/api*_spec.js',
                        'core/test/integration/*_spec.js'
                    ]
                },

                // ##### Model integration tests
                model: {
                    src: ['core/test/integration/**/model*_spec.js']
                },

                // ##### API integration tests
                api: {
                    src: ['core/test/integration/**/api*_spec.js']
                },

                // #### All Module tests
                module: {
                    src: [
                        'core/test/functional/module/**/*_test.js'
                    ]
                }
            },

            // ### grunt-shell
            // Command line tools where it's easier to run a command directly than configure a grunt plugin
            shell: {
                // #### Generate coverage report
                // See the `grunt test-coverage` task in the section on [Testing](#testing) for more information.
                coverage: {
                    command: path.resolve(cwd  + '/node_modules/mocha/bin/mocha  --timeout 15000 --reporter' +
                    ' html-cov > coverage.html ./core/test/blanket_coverage.js'),
                    execOptions: {
                        env: 'NODE_ENV=' + process.env.NODE_ENV
                    }
                }
            },

            // ### grunt-docker
            // Generate documentation from code
            docker: {
                docs: {
                    dest: 'docs',
                    src: ['.'],
                    options: {
                        onlyUpdated: true,
                        exclude: 'node_modules,.git,.tmp,bower_components,content,*built,*test,*doc*,*vendor,' +
                        'config.js,coverage.html,.travis.yml,*.min.css,screen.css',
                        extras: ['fileSearch']
                    }
                }
            },

            // ### grunt-contrib-clean
            // Clean up files as part of other tasks
            clean: {
                test: {
                    src: ['content/data/icollege-test.db']
                },
                tmp: {
                    src: ['.tmp/**']
                }
            },

            // ### grunt-update-submodules
            // Grunt task to update git submodules
            update_submodules: {
                default: {
                    options: {
                        params: '--init'
                    }
                }
            }
        };

        // Load the configuration
        grunt.initConfig(cfg);

        // ## Utilities
        //

        // # Custom Tasks

        // iCollege has a number of useful tasks that we use every day in development. Tasks marked as *Utility* are used
        // by grunt to perform current actions, but isn't useful to developers.
        //
        // Skip ahead to the section on:
        //
        // * [Building assets](#building%20assets):
        //     `grunt init`, `grunt` & `grunt prod` or live reload with `grunt dev`
        // * [Testing](#testing):
        //     `grunt validate`, the `grunt test-*` sub-tasks or generate a coverage report with `grunt test-coverage`.

        // ### Help
        // Run `grunt help` on the commandline to get a print out of the available tasks and details of
        // what each one does along with any available options. This is an alias for `grunt --help`
        grunt.registerTask('help',
            'Outputs help information if you type `grunt help` instead of `grunt --help`',
            function () {
                console.log('Type `grunt --help` to get the details of available grunt tasks, ' +
                'or alternatively visit https://42.96.195.83/guanggu/icollege');
            });

        // ### Documentation
        // Run `grunt docs` to generate annotated source code using the documentation described in the code comments.
        grunt.registerTask('docs', 'Generate Docs', ['docker']);

        // ## Testing

        // iCollege has an extensive set of test suites. The following section documents the various types of tests
        // and how to run them.
        //
        // TLDR; run `grunt validate`

        // #### Set Test Env *(Utility Task)*
        // Set the NODE_ENV to 'testing' unless the environment is already set to TRAVIS.
        // This ensures that the tests get run under the correct environment, using the correct database, and
        // that they work as expected. Trying to run tests with no ENV set will throw an error to do with `client`.
        grunt.registerTask('setTestEnv',
            'Use "testing" iCollege config; unless we are running on travis (then show queries for debugging)',
            function () {
                process.env.NODE_ENV = process.env.TRAVIS ? process.env.NODE_ENV : 'testing';
                cfg.express.test.options.node_env = process.env.NODE_ENV;
            });

        // #### Ensure Config *(Utility Task)*
        // Make sure that we have a `config.js` file when running tests
        // iCollege requires a `config.js` file to specify the database settings etc. iCollege comes with an example file:
        // `config.example.js` which is copied and renamed to `config.js` by the bootstrap process
        grunt.registerTask('ensureConfig', function () {
            var config = require('./core/server/config'),
                done = this.async();
            config.load().then(function () {
                done();
            }).catch(function (err) {
                grunt.fail.fatal(err.stack);
            });
        });

        // #### Reset Database to "New" state *(Utility Task)*
        // Drops all database tables and then runs the migration process to put the database
        // in a "new" state.
        grunt.registerTask('cleanDatabase', function () {
            var done = this.async(),
                models    = require('./core/server/models'),
                migration = require('./core/server/data/migration');

            migration.reset().then(function () {
                return models.init();
            }).then(function () {
                return migration.init();
            }).then(function () {
                done();
            }).catch(function (err) {
                grunt.fail.fatal(err.stack);
            });
        });

        // ### Validate
        // **Main testing task**
        //
        // `grunt validate` will build, lint and test your local iCollege codebase.
        //
        // `grunt validate` is one of the most important and useful grunt tasks that we have available to use. It
        // manages the build of your environment and then calls `grunt test`
        //
        // `grunt validate` is called by `npm test` and is used by Travis.
        grunt.registerTask('validate', 'Run tests and lint code',
            ['test']);

        // ### Test
        // **Main testing task**
        //
        // `grunt test` will lint and test your pre-built local iCollege codebase.
        //
        // `grunt test` runs jshint and jscs as well as the 4 test suites. See the individual sub tasks below for
        // details of each of the test suites.
        //
        grunt.registerTask('test', 'Run tests and lint code',
            ['lint', 'test-module', 'test-unit', 'test-integration']);

        // ### Lint
        //
        // `grunt lint` will run the linter and the code style checker so you can make sure your code is pretty
        grunt.registerTask('lint', 'Run the code style checks and linter', ['jshint', 'jscs']);

        // ### Unit Tests *(sub task)*
        // `grunt test-unit` will run just the unit tests
        //
        // Provided you already have a `config.js` file, you can run individual sections from
        // [mochacli](#grunt-mocha-cli) by running:
        //
        // `NODE_ENV=testing grunt mochacli:section`
        //
        // If you need to run an individual unit test file, you can do so, providing you have mocha installed globally
        // by using a command in the form:
        //
        // `NODE_ENV=testing mocha --timeout=15000 --ui=bdd --reporter=spec core/test/unit/config_spec.js`
        //
        // Unit tests are run with [mocha](http://mochajs.org/) using
        // [should](https://github.com/visionmedia/should.js) to describe the tests in a highly readable style.
        // Unit tests do **not** touch the database.
        // A coverage report can be generated for these tests using the `grunt test-coverage` task.
        grunt.registerTask('test-unit', 'Run unit tests (mocha)',
            ['clean:test', 'setTestEnv', 'ensureConfig', 'mochacli:unit']);

        // ### Integration tests *(sub task)*
        // `grunt test-integration` will run just the integration tests
        //
        // Provided you already have a `config.js` file, you can run just the model integration tests by running:
        //
        // `NODE_ENV=testing grunt mochacli:model`
        //
        // Or just the api integration tests by running:
        //
        // `NODE_ENV=testing grunt mochacli:api`
        //
        // Integration tests are run with [mocha](http://mochajs.org/) using
        // [should](https://github.com/visionmedia/should.js) to describe the tests in a highly readable style.
        // Integration tests are different to the unit tests because they make requests to the database.
        //
        // If you need to run an individual integration test file you can do so, providing you have mocha installed
        // globally, by using a command in the form (replace path to api_tags_spec.js with the test file you want to
        // run):
        //
        // `NODE_ENV=testing mocha --timeout=15000 --ui=bdd --reporter=spec core/test/integration/api/api_tags_spec.js`
        //
        // Their purpose is to test that both the api and models behave as expected when the database layer is involved.
        // These tests are run against sqlite3, mysql and pg on travis and ensure that differences between the databases
        // don't cause bugs. At present, pg often fails and is not officially supported.
        //
        // A coverage report can be generated for these tests using the `grunt test-coverage` task.
        grunt.registerTask('test-integration', 'Run integration tests (mocha + db access)',
            ['clean:test', 'setTestEnv', 'ensureConfig', 'mochacli:integration']);

        // ### Module tests *(sub task)*
        // `grunt test-module` will run just the module tests
        //
        // The purpose of the module tests is to ensure that iCollege can be used as an npm module and exposes all
        // required methods to interact with it.
        grunt.registerTask('test-module', 'Run functional module tests (mocha)',
            ['clean:test', 'setTestEnv', 'ensureConfig', 'mochacli:module']);

        // ### Functional tests *(sub task)*
        // `grunt test-functional` will run just the functional tests
        //
        // You can use the `--target` argument to run any individual test file, or the admin or frontend tests:
        //
        // `grunt test-functional --target=admin/editor_test.js` - run just the editor tests
        //
        // `grunt test-functional --target=admin/` - run all of the tests in the admin directory
        //
        // An express server is started with the testing environment set.
        //
        // The purpose of the functional tests is to ensure that iCollege is working as is expected from a user perspective
        // including buttons and other important interactions in the admin UI.
        //@TODO write logic supporting functional test
        grunt.registerTask('test-functional', 'Run functional interface tests (Test RestFul Webservice)',
            ['clean:test', 'setTestEnv', 'ensureConfig', 'express:test',/* here need logic*/ 'express:test:stop']
        );

        // ### Coverage
        // `grunt test-coverage` will generate a report for the Unit and Integration Tests.
        //
        // This is not currently done as part of CI or any build, but is a tool we have available to keep an eye on how
        // well the unit and integration tests are covering the code base.
        // iCollege does not have a minimum coverage level - we're more interested in ensuring important and useful areas
        // of the codebase are covered, than that the whole codebase is covered to a particular level.
        //
        // Key areas for coverage are: helpers and theme elements, apps / GDK, the api and model layers.
        grunt.registerTask('test-coverage', 'Generate unit and integration (mocha) tests coverage report',
            ['clean:test', 'setTestEnv', 'ensureConfig', 'shell:coverage']);


        // #### Master Warning *(Utility Task)*
        // Warns git users not ot use the `master` branch in production.
        // `master` is an unstable branch and shouldn't be used in production as you run the risk of ending up with a
        // database in an unrecoverable state. Instead there is a branch called `stable` which is the equivalent of the
        // release zip for git users.
        grunt.registerTask('master-warn',
            'Outputs a warning to runners of grunt dev, that master shouldn\'t be used for live platform',
            function () {
                console.log('>', 'Always two there are, no more, no less. A master and a'.red,
                    'stable'.red.bold + '.'.red);
                console.log('Use the', 'stable'.bold, 'branch for live platform.', 'Never'.bold, 'master!');
            });


        // ### Live reload
        // `grunt dev` - build assets on the fly whilst developing
        //
        // If you want iCollege to live reload for you whilst you're developing, you can do this by running `grunt dev`.
        // This works hand-in-hand with the [livereload](http://livereload.com/) chrome extension.
        //
        // `grunt dev` manages starting an express server and restarting the server whenever core files change (which
        // require a server restart for the changes to take effect) and also manage reloading the browser whenever
        // frontend code changes.
        //
        // Note that the current implementation of watch only works with casper, not other themes.
        grunt.registerTask('dev', 'Dev Mode; watch files and restart server on changes',
            ['express:dev', 'watch']);
    };

// Export the configuration
module.exports = configureGrunt;
