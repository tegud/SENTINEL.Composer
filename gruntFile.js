'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        env: {
            dev: {
                NODE_ENV: 'dev'
            }
        },
        jshint: {
            all: [
                'Gruntfile.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        },
        mochacli: {
            src: ['test/**/*.js'],
            options: {
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'mochacli']);
};
