// Generated on 2014-07-17 using generator-yawa 0.4.7
'use strict';
var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

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
      app: require('./bower.json').appPath || 'static',
      dist: 'dist'
    },
    watch: {
      ts: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.ts'],
        tasks: ['ts:build'],
        options: {
          livereload: true
        }
      },
      sass: {
        files: ['<%= yeoman.app %>/{,*/}*.scss'],
        tasks: ['sass:dev']
      },
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['coffee:test']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          'server/{,*/}*.js'
        ]
        //,tasks: [ 'bless:server']
      }
    },
    wiredep: {
      app: {
        src: [
          '<%= yeoman.app %>/index.html'
        ]
      }
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/styles/',
            src: '{,*/}*.css',
            dest: '.tmp/styles/'
          }
        ]
      }
    },
    sass: {
      dist: {                            // target
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/',
          src: '**/*.scss',
          dest: '<%= yeoman.app %>/',
          ext: '.css'
        }]
      },
      dev: {                              // another target
        options: {                      // dictionary of render options
          sourceMap: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/',
          src: '**/*.scss',
          dest: '<%= yeoman.app %>/',
          ext: '.css'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      proxies: [ // Local
        {
          context: '/api',
          host: 'localhost',
          port: 9002
        }
      ],
      livereload: {
        options: {
          middleware: function (connect, options) {
            var middlewares = [];
            middlewares.push(proxySnippet);
            options.base.forEach(function (base) {
              // Serve static files.
              middlewares.push(connect.static(base));
            });
            return middlewares;
          },
          open: true,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          middleware: function (connect, options) {
            var middlewares = [];
            middlewares.push(proxySnippet);
            options.base.forEach(function (base) {
              // Serve static files.
              middlewares.push(connect.static(base));
            });
            return middlewares;
          },
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          middleware: function (connect, options) {
            var middlewares = [];
            middlewares.push(proxySnippet);
            options.base.forEach(function (base) {
              // Serve static files.
              middlewares.push(connect.static(base));
            });
            return middlewares;
          },
          base: '<%= yeoman.dist %>'
        }
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
      deploy: {
        files: [
          {
            dot: true,
            src: 'deploy/**'
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
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        'server/{,*/}*.js'
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
    bless: {
      server: {
        css: {
          options: {
            cacheBuster: false,
            compress: false
          },
          files: {
            '.tmp/styles/main.css': '.tmp/styles/*.css'
          }
        }
      },
      dist: {
        options: {
          cacheBuster: false,
          compress: true
        },
        files: {
          '<%= yeoman.dist %>/styles/main.css': '<%= yeoman.dist %>/styles/*.css'
        }
      }
    },

    ts: {
      // A specific target
      build: {
        // The source TypeScript files, http://gruntjs.com/configuring-tasks#files
        src: ['<%= yeoman.app %>/scripts/**/*.ts'],
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
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
     dist: {}
     },*/
    requirejs: {
      dist: {
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          // `name` and `out` is set by grunt-usemin
          baseUrl: '.tmp/scripts',
          optimize: 'none',
          // TODO: Figure out how to make sourcemaps work with grunt-usemin
          // https://github.com/yeoman/grunt-usemin/issues/30
          //generateSourceMaps: true,
          // required to support SourceMaps
          // http://requirejs.org/docs/errors.html#sourcemapcomments
          preserveLicenseComments: false,
          useStrict: true,
          wrap: true
          //uglify2: {} // https://github.com/mishoo/UglifyJS2
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
            '<%= yeoman.dist %>/fonts/{,*/}*.*'
          ]
        }
      }
    },
    useminPrepare: {
      options: {
        dest: '<%= yeoman.dist %>'
      },
      html: '<%= yeoman.app %>/index.html'
    },
    usemin: {
      options: {
        dirs: ['<%= yeoman.dist %>']
      },
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
    },
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.{png,jpg,jpeg}',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    cssmin: {
      // This task is pre-configured if you do not wish to use Usemin
      // blocks for your CSS. By default, the Usemin block from your
      // `index.html` will take care of minification, e.g.
      //
      //     <!-- build:css({.tmp,app}) styles/main.css -->
      //
      // dist: {
      //     files: {
      //         '<%= yeoman.dist %>/styles/main.css': [
      //             '.tmp/styles/{,*/}*.css',
      //             '<%= yeoman.app %>/styles/{,*/}*.css'
      //         ]
      //     }
      // }
    },
    htmlmin: {
      dist: {
        options: {
          removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          // collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: false,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>',
            src: '*.html',
            dest: '<%= yeoman.dist %>'
          }
        ]
      },
      deploy: {
        options: {
          collapseWhitespace: true
        },
        files: 'deploy'
      },
      deploycleanup: {
        options: {
          collapseWhitespace: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: '{,*/}*.html',
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              'images/{,*/}*.{webp,gif}',
              'fonts/{,*/}*.*'
            ]
          }
        ]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles',
        src: '**/*.css'
      },
      stylesd: {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '<%= yeoman.dist %>/styles',
        src: '**/*.css'
      },
      scripts: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>/scripts',
            dest: '<%= yeoman.dist %>/scripts/',
            src: '**/*.{js,css,png,jpg,svg,txt}'
          },
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
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
              'data/**',
              'server/**'
            ]
          },
          {
            expand: true,
            dot: true,
            dest: 'deploy/static',
            src: 'dist/**'
          }
        ]
      }
    },
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin:dist'
      ]
    },
    bower: {
      options: {
        exclude: ['modernizr']
      },
      all: {
        rjsConfig: '<%= yeoman.app %>/scripts/main.js'
      }
    },
    jsdoc: {
      dist: {
        src: ['app/scripts/{,*/}*.js', 'test/spec/{,*/}*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    express: {
      options: {
        hostname: 'localhost',
        port: 9002,
        livereload: true,
        serverreload: true,
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
      addAll: {
        cmd: function () {
          return 'cd deploy; git commit --all -m "deploy ' + new Date() + '"';
        }
      },
      push: {
        cmd: 'cd deploy; git push'
      }
    }
  });


  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'configureProxies',
      'wiredep',
      'express:custom',
      'autoprefixer',
      //'copy:scripts',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('serverd', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'configureProxies',
      'wiredep',
      'express:debug',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'mocha'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'tsd:refresh',
    'ts:build',
    'sass:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'copy:scripts',
    //'requirejs',,
    'jsdoc',
    //'concat',
    //'cssmin',
    'uglify',
    'copy:dist',
    'bless:dist'
    //'rev',
    //'usemin',
    //'htmlmin:deploy'
  ]);

  grunt.registerTask('buildd', [
    'clean:dist',
    'tsd:refresh',
    'ts:build',
    'sass:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'copy:scripts',
    'copy:stylesd',
    'jsdoc',
    'copy:dist',
    'bless:dist'
  ]);

  grunt.registerTask('deploy', [
    'clear:deploy',
    'exec:clone',
    'clear:deploycleanup',
    'copy:deploy',
    'exec:add',
    'exec:push'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'buildd'
  ]);
};
