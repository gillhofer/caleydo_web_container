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
      dist: '_dist',
      deploy: '_deploy',
      doc: '_doc'
    },
    watch: {
      ts: {
        files: ['plugins/**/*.ts'],
        tasks: ['ts:build']
      },
      sass: {
        files: ['plugins/**/**.scss'],
        tasks: ['sass:dev']
      },
      coffee: {
        files: ['plugins/**/*.coffee'],
        tasks: ['coffee:dist']
      }
    },
    sass: {
      dist: {                            // target
        files: [{
          expand: true,
          src: ['plugins/**/*.scss'],
          dest: '',
          ext: '.css'
        }]
      },
      dev: {                              // another target
        options: {                      // dictionary of render options
          sourceMap: false
        },
        files: [{
          expand: true,
          src: ['plugins/**/*.scss'],
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
      deploy: '<%= yeoman.deploy %>',
      deploycleanup: {
        files: [
          {
            dot: true,
            src: [
              '<%= yeoman.deploy %>/*',
              '!<%= yeoman.deploy %>/.git*'
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
        'plugins/**/*.js'
      ]
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      all: {
        src: ['plugins/**/*.ts'],
      }
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
        src: ['plugins/**/*.ts'],
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
          latest: false,

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
            src: [ 'plugins/**/*.{htaccess,webp,gif,js,css,png,jpg,svg,txt,htm,html,xhtml,ico,json,csv,tsv}','!_**/*']
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
            dest: '<%= yeoman.deploy %>',
            src: [
              'Procfile',
              'package.json'
            ]
          },
          {
            expand: true,
            dot: true,
            dest: '<%= yeoman.deploy %>',
            cwd : '<%= yeoman.dist %>',
            src: '**'
          }
        ]
      }
    },
    jsdoc: {
      dist: {
        src: ['plugins/**/*.js'],
        options: {
          destination: '<%= yeoman.doc %>'
        }
      }
    },
    express: {
      options: {
        hostname: 'localhost',
        port: 9000,
        server: require('path').resolve('./plugins/caleydo_server_js/index'),
        bases: [require('path').resolve('./plugins/caleydo_server_js')]
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
      _default: {
        cmd: 'python plugins/caleydo_server',
        bg: true,
        stdout: function (data) {
          grunt.log.write('server(' + data.length + '): ' + data);
        },
        fail: true
      },
      debug: {

      }
    }
  });

  grunt.registerTask('server_js', [
    'clean:server',
    'express:debug',
    'watch'
  ]);
  grunt.registerTask('server', [
    'clean:server',
    'bgShell:debug',
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
    //'tsd:refresh',
    'ts:build',
    'sass:dist',
    'copy:plugins',
    'jsdoc'
  ]);

  grunt.registerTask('default', [
    'buildd',
    'tslint',
    'jshint'
  ]);

  grunt.registerTask('resolveDependencies', 'Resolves the dependencies from the current plugins and creates the type specific files', function() {
  var options = this.options({
      plugins: ['plugins/**/package.json'],
      target:  {
        web : 'bower.json',
        node : 'npm.package.json',
        python: 'requirements.txt'
      },
      converter : {
        web: function(deps) {
          return JSON.stringify({
             name: 'caleydo-web',
             version: '0.0.1',
             dependencies: deps
           }, null, 2);
        },
        node: function(deps) {
          return JSON.stringify({
             name: 'caleydo-web',
             version: '0.0.1',
             dependencies: deps
           }, null, 2);
        },
        apt: function(deps) {
          return Object.keys(deps).map(function(d) {
            return d+deps[d];
          }).join(' ')
        },
        tsd: function(deps) {
          return Object.keys(deps).map(function(d) {
            return d+';'+deps[d];
          }).join('\n')
        },
        //suitable for python
        _default : function(deps) {
          return Object.keys(deps).map(function(d) {
            return d+deps[d];
          }).join('\n')
        }
      }
    });
    grunt.log.writeln(options.plugins);
    var dependencies = { };
    var semver = require('semver');

    /**
     * merges a dependency list
     */
    function addDependency(type, deps) {
      if (type in dependencies) {
        var existing = dependencies[type];
        Object.keys(deps).forEach(function(d) {
          if (d in existing) {
            var new_ = deps[d],
              old = existing[d];
            if (old.indexOf(new_)>=0) { //keep the old one
              //nothing to do
            } else { //merge
              existing[d] = old+','+new_;
            }
            grunt.log.writeln('resvoling: '+old+' '+new_+' to '+existing[d]);
          } else {
            existing[d] = deps[d];
          }
        });
      } else {
        dependencies[type] = deps
      }
    }
    //parse all package.json files
    grunt.file.expand(options.plugins).forEach(function(plugin) {
	  grunt.log.writeln(plugin);
      var desc = grunt.file.readJSON(plugin);
      if ('caleydo' in desc && 'dependencies' in desc.caleydo) {
        Object.keys(desc.caleydo.dependencies).forEach(function(type) {
          addDependency(type, desc.caleydo.dependencies[type]);
        });
      }
    });

	  grunt.log.writeln(JSON.stringify(dependencies));

    //generate the dependency files
    Object.keys(dependencies).forEach(function(d) {
      var target = options.target[d] || d+'.txt';
      var converter = options.converter[d] || options.converter._default;
      var r = converter(dependencies[d]);
      grunt.file.write(target, r);
    });
  });
};
