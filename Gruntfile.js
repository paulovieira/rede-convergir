module.exports = function(grunt) {


    grunt.initConfig({

        /*** nunjucks - compile client-side templates (to be loaded using nunjucks-slim) ***/

        nunjucks: {

            dashboard: {
                baseDir: 'client/dashboard',
                src: ['client/dashboard/**/*.html'],
                dest: 'client/dashboard/templates.js',
                options: {}
            },

            dashboard3: {
                baseDir: 'client/dashboard3',
                src: ['client/dashboard3/**/*.html'],
                dest: 'client/dashboard3/templates.js',
                options: {}
            },

            mapa: {
                baseDir: 'client/mapa',
                src: ['client/mapa/**/*.html'],
                dest: 'client/mapa/templates.js',
                options: {}
            },

            ferramenta: {
                baseDir: 'client/ferramenta',
                src: ['client/ferramenta/**/*.html'],
                dest: 'client/ferramenta/templates.js',
                options: {}
            },
        },


        /*** browserify - compile client-side apps ***/

        browserify: {

            "lib": {
                src: [],
                dest: 'client/test/lib.js',
                options: {
                    alias: [
                        './client/common/js/jquery-1.11.2.js:jQuery',
                    ]
                }
            },

            // "test-dev": {
            //     src: ["client/test/js/**/*.js"],
            //     dest: "client/test/app.js",
            //     options: {
            //     	external: ['jQuery'],
            //         browserifyOptions: {
            //             debug: true
            //         }
            //     },
            // },

            // "test-prod": {
            //     src: ["client/test/js/**/*.js"],
            //     dest: "client/test/app.js",
            //     //exclude: "client/test/app.js",
            //     options: {
            //         banner: "/** this is the banner for the prod version **/",
            //     	external: ['jQuery'],
            //         browserifyOptions: {
            //             debug: false
            //         }
            //     }
            // },

            "dashboard2-dev": {
                //src: ["client/dashboard2/js/**/*.js"],
                src: "client/dashboard2/index.js",
                dest: "client/dashboard2/app-dev.js",
                //exclude: ["client/dashboard2/app-dev.js", "client/dashboard2/app-prod.js"],
                options: {
                    //external: ['jQuery'],
                    banner: "/** dev version **/",
                    browserifyOptions: {
                        debug: true
                    }
                },
            },

            "dashboard2-prod": {
                //src: ["client/dashboard2/js/**/*.js"],
                src: "client/dashboard2/index.js",
                dest: "client/dashboard2/app-prod.js",
                //exclude: ["client/dashboard2/app-dev.js", "client/dashboard2/app-prod.js"],
                options: {
                    banner: "/** prod version **/",
                    //external: ['jQuery'],
                    browserifyOptions: {
                        debug: false
                    }
                }
            }
        },


        /*** watch task ***/

        watch: {
            "dashboard templates": {
                files: 'client/dashboard/**/*.html',
                tasks: ['nunjucks:dashboard']
            },
            "dashboard3 templates": {
                files: 'client/dashboard3/**/*.html',
                tasks: ['nunjucks:dashboard3']
            },
            "mapa templates": {
                files: 'client/mapa/**/*.html',
                tasks: ['nunjucks:mapa']
            },
            "ferramenta templates": {
                files: 'client/ferramenta/**/*.html',
                tasks: ['nunjucks:ferramenta']
            },
            // "compile-js-dev test": {
            //     files: 'client/test/js/**/*.js',
            //     tasks: ['browserify:test-dev']
            // },
            "compile-js dashboard2": {
                files: [
                    'client/dashboard2/**/*.js', 
                    '!client/dashboard2/node_modules/**/*.js', 
                    '!client/dashboard2/app-dev.js', 
                    '!client/dashboard2/app-prod.js'
                ],
                tasks: [
                    'browserify:dashboard2-dev', 
                    'browserify:dashboard2-prod'
                ]
            },
        }
    });

    grunt.loadNpmTasks('grunt-nunjucks');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // register task(can be explicitely executed in the command line: "grunt compile-js" will compile all the client-side apps)

    // NOTE: "grunt compile-js:test" and "grunt browserify:test" are equivalent (will execute the same task:target)
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('compile-templates', ['nunjucks:dashboard', 'nunjucks:ferramenta']);
    grunt.registerTask('compile-dashboard', ['browserify:dashboard2-dev', 'browserify:dashboard2-prod']);


};
