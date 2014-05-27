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
          script: 'src/server/app-dev.js'
        }
      },
      mock: {
        options: {
          script: 'test/mock/server/app.js'
        }
      }
    },
    watch: {
      express: {
        files: [
          'src/server/**/*.js',
          'src/server/ui/**/*.*htm*',
          'config/config*.json'
        ],
        tasks: [ 'express:dev' ],
        options: {
          spawn: false
        }
      },
      mock: {
        files: ['test/mock/**/*'],
        tasks: ['express:mock'],
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
  grunt.registerTask('run', ['express:mock', 'express:dev', 'watch']);

};