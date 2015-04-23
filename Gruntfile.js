module.exports = function(grunt) {
    grunt.initConfig({
        apidoc: {
            app: {
                src: 'app/routers',
                dest: 'public/apidoc'
            }
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
};
