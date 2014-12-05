// Generated on 2014-07-17 using generator-yawa 0.4.7
'use strict';
// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  var JENKINS = grunt.option('jenkins');
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    // configurable paths
    yeoman: {
      // configurable paths
      app: 'plugins',
      dist: 'dist'
    },
    watch: {
      ts: {
        files: ['{plugins,external,server}/**/*.ts'],
        tasks: ['ts:build']
      },
      sass: {
        files: ['{plugins,external,server}/**/*.scss'],
        tasks: ['sass:dev']
      },
      coffee: {
        files: ['{plugins,external,server}/**/*.coffee'],
        tasks: ['coffee:dist']
      }
    },
    sass: {
      dist: {                            // target
        files: [{
          expand: true,
          src: ['{plugins,external,server}/**/*.scss'],
          dest: '',
          ext: '.css'
        }]
      },
      dev: {                              // another target
        options: {                      // dictionary of render options
          sourceMap: true
        },
        files: [{
          expand: true,
          src: ['{plugins,external,server}/**/*.scss'],
          dest: '',
          ext: '.css'
        }]
      }
    },
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp',
      deploy: 'deploy',
      deploycleanup: {
        files: [
          {
            dot: true,
            src: [
              'deploy/*',
              '!deploy/.git*'
            ]
          }
        ]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: (JENKINS && 'checkstyle') || require('jshint-stylish'),
        reporterOutput: JENKINS && 'jshint.xml',
        force : true
      },
      all: [
        'Gruntfile.js',
        '{plugins,external,server}/**/*.js'
      ]
    },
    mocha: {
      all: {
        options: {
          run: false,
          urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/test.html'],
          reporter: 'XUnit'
        },
        dest: './test/xunit.xml'
      }
    },
    ts: {
      // A specific target
      build: {
        // The source TypeScript files, http://gruntjs.com/configuring-tasks#files
        src: ['{plugins,external,server}/**/*.ts'],
        // If specified, generate this file that to can use for reference management
        reference: 'tsd.gen.d.ts',
        // If specified, the generate JavaScript files are placed here. Only works if out is not specified
        //outDir: 'test/outputdirectory',
        // If specified, watches this directory for changes, and re-runs the current target
        //watch: '<%= yeoman.app %>/scripts',
        // Use to override the default options, http://gruntjs.com/configuring-tasks#options
        options: {
          target: 'es5',
          module: 'amd', // 'amd' (default) | 'commonjs'
          sourceMap: true,
          declaration: false,
          removeComments: false
        }
      }
    },

    tsd: {
      refresh: {
        options: {
          // execute a command
          command: 'reinstall',

          //optional: always get from HEAD
          latest: true,

          // specify config file
          config: 'tsd.json',

          // experimental: options to pass to tsd.API
          opts: {
            // props from tsd.Options
          }
        }
      }
    },
    // Put files not handled in other tasks here
    copy: {
      plugins: {
        files: [
          {
            expand: true,
            dot: true,
            dest: '<%= yeoman.dist %>',
            src: '{plugins,external,server}/**/*.{htaccess,webp,gif,js,css,png,jpg,svg,txt,htm,html,xhtml,ico,json}'
          },
          {
            expand: true,
            dot: true,
            dest: '<%= yeoman.dist %>',
            src: ['bower_components/**']
          }
        ]
      },
      deploy: {
        files: [
          {
            expand: true,
            dot: true,
            dest: 'deploy',
            src: [
              'Procfile',
              'package.json',
              'data/**'
            ]
          },
          {
            expand: true,
            dot: true,
            dest: 'deploy',
            cwd : '<%= yeoman.dist %>',
            src: '**'
          }
        ]
      }
    },
    jsdoc: {
      dist: {
        src: ['{plugins,external,server}/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    express: {
      options: {
        hostname: 'localhost',
        port: 9000,
        server: require('path').resolve('./server/index'),
        bases: [require('path').resolve('./server')]
      },
      custom: {
        options: {
        }
      },
      debug: {
        options: {
          'debug-brk': 5858,
          showStack: true
        }
      }
    },
    bgShell: {
      _defaults: {
        cmd: 'python api.py',
        bg: true,
        stdout: function (data) {
          grunt.log.write('out: ' + data.length + ' ' + data);
        },
        fail: true
      },
      local: {
        execOpts: {
          cwd: '../caleydo-web-server/flask/',
          maxBuffer: false
        }
      },
      vagrant: {
        execOpts: {
          cwd: '../vagrant/flask/',
          maxBuffer: false
        }
      }
    },
    exec: {
      clone: {
        cmd: 'git clone git@heroku.com:caleydo-web.git deploy'
      },
      commit: {
        cmd: function () {
          return 'cd deploy; git add *; git commit --all -m "deploy ' + new Date() + '"';
        }
      },
      push: {
        cmd: 'cd deploy; git push'
      }
    }
  });


  grunt.registerTask('server', [
    'clean:server',
    'express:custom',
    'watch'
  ]);

  grunt.registerTask('serverd', [
    'clean:server',
    'express:debug',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'ts:build',
    'sass:dist',
    'express:custom',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'tsd:refresh',
    'ts:build',
    'sass:dist',
    'copy:plugins',
    'jsdoc'
  ]);

  grunt.registerTask('buildd', [
    'clean:dist',
    'tsd:refresh',
    'ts:build',
    'sass:dist',
    'copy:plugins',
    'jsdoc'
  ]);

  grunt.registerTask('deploy', [
    'clean:deploy',
    'exec:clone',
    'clean:deploycleanup',
    'copy:deploy',
    'exec:commit',
    'exec:push'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'buildd'
  ]);
};
