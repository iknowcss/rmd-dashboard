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
      options: { },
      mock: {
        options: {
          script: 'test/mock/server/app.js'
        }
      },
      dev: {
        options: {
          script: 'src/server/app-dev.js'
        }
      },
      e2e: {
        options: {
          script: 'src/server/app.js'
        }
      }
    },
    watch: {
      'express-dev': {
        files: [
          'src/server/**/*.js',
          'src/server/ui/**/*.*htm*',
          'config/config-dev.json',
          'test/mock/**/*'
        ],
        tasks: ['express:mock', 'express:dev'],
        options: { spawn: false }
      },
      'express-e2e': {
        files: [
          'src/server/**/*.js',
          'src/server/ui/html/**/*.*htm*',
          'config/config.json'
        ],
        tasks: ['express:e2e'],
        options: { spawn: false }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jasmine_node']);
  grunt.registerTask('run', ['run:dev']);
  grunt.registerTask('run:dev', ['express:mock', 'express:dev', 'watch:express-dev']);
  grunt.registerTask('run:e2e', ['express:e2e', 'watch:express-e2e']);

  grunt.registerTask('run:e2e', ['express:e2e', 'watch:express-e2e']);

};