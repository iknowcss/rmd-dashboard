module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        options: {
          targetDir: './lib/ui',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: true,
          bowerOptions: {}
        }
      }
    },
    jasmine_node: {
      all: 'spec/server/'
    },
    jasmine: {

    },
    express: {
      options: {

      },
      dev: {
        options: {
          script: 'src/server/app.js',
          port: 1234
        }
      }
    },
    watch: {
      express: {
        files:  [ 'src/server/**/*.js' ],
        tasks:  [ 'express:dev' ],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jasmine_node']);
  grunt.registerTask('run', ['express:dev', 'watch']);

};