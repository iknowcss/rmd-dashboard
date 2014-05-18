module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: './ui-lib',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: true,
          bowerOptions: {}
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');

  // Default tasks
  grunt.registerTask('default', [
    'bower:install'
  ]);

};