module.exports = function(grunt) {
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        coveralls: {
            options: {
                debug: true,
                coverageDir: 'tests/coverage/PhantomJS/',
                dryRun: true,
                force: true,
                recursive: true
            }
        },
 
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });
 
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-karma-coveralls');

    grunt.registerTask('default', ['karma', 'coveralls']);

};