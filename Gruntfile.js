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

  grunt.config.init({
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
        tasks: ['ts:dev']
      },
      sass: {
        files: ['plugins/**/**.scss'],
        tasks: ['sass:dev']
      },
      coffee: {
        files: ['plugins/**/*.coffee'],
        tasks: ['coffee:dev']
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
          sourceMap: true
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
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: (JENKINS && 'checkstyle') || require('jshint-stylish'),
        reporterOutput: JENKINS && 'jshint.xml',
        force: true
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
        src: ['plugins/**/*.ts']
      }
    },
    ts: {
      // A specific target
      dev: {
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
      },
      // A specific target
      dist: {
        src: ['plugins/**/*.ts'],
        reference: 'tsd.gen.d.ts',
        options: {
          target: 'es5',
          module: 'amd', // 'amd' (default) | 'commonjs'
          sourceMap: false,
          declaration: false,
          removeComments: true
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
      dist: {
        files: [
          { //copy the plugins
            expand: true,
            dot: true,
            cwd: 'plugins/',
            dest: '<%= yeoman.dist %>',
            src: ['**/*.{htaccess,webp,gif,js,css,png,jpg,svg,txt,htm,html,xhtml,ico,json,csv,tsv,py}', '!*/_**/*']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            cwd: 'static/',
            dest: '<%= yeoman.dist %>',
            src: ['**/*']
          },
          { //copy bower dependencies
            expand: true,
            dot: true,
            cwd: 'libs/bower_components/',
            dest: '<%= yeoman.dist %>/bower_components/',
            src: ['**']
          },
          { //copy bower dependencies
            expand: true,
            dot: true,
            dest: '<%= yeoman.dist %>',
            src: ['package.json', 'config.ini']
          }
        ]
      },
      server_dist: {
        files: [{ //copy the plugins
          expand: true,
          dot: true,
          cwd: 'plugins/caleydo_server/_deploy/',
          dest: '<%= yeoman.dist %>',
          src: '**/*'
        }]
      },
      server_js_dist: {
        files: [{ //copy the plugins
          expand: true,
          dot: true,
          cwd: 'plugins/caleydo_server_js/_deploy/',
          dest: '<%= yeoman.dist %>',
          src: '**/*'
        }]
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
        options: {}
      },
      debug: {
        options: {
          'debug-brk': 5858,
          showStack: true
        }
      }
    },
    bgShell: {
      options: {},
      debug: {
        cmd: 'python plugins/caleydo_server',
        bg: true,
        fail: true
      },
      static: {
        cmd: function () {
          //generates the config files for a specific context and application
          var r = grunt.config.process('python plugins/caleydo_server/deployhelper.py -t <%= yeoman.dist %>');
          var app = grunt.option('application') || null;
          var context = grunt.option('context') || null;
          if (app) {
            r += ' --application=' + app;
          }
          if (context) {
            r += ' --context=' + context;
          }
          return r;
        },
        bg: false
      }
    },
    resolve_dependencies: {
      dist: {
        options: {
          target_dir: '<%= yeoman.dist %>'
        }
      },
      dev: {

      }
    },
    compress: {
      package_static: {
        options: {
          archive: '<%=yeoman.dist%>/caleydo_static.zip'
        },
        files: [
          { //copy the plugins
            expand: true,
            dot: true,
            cwd: 'plugins',
            src: ['**/*.{htaccess,webp,gif,js,css,png,jpg,svg,txt,htm,html,xhtml,ico,json,csv,tsv,py}', '!*/_**/*', '!caleydo_server*/**']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            cwd: 'libs/bower_components',
            dest: 'bower_components',
            src: ['**/*']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            cwd: 'static',
            dest: '.',
            src: ['**/*']
          },
          { //copy dumped generated files
            expand: true,
            dot: true,
            cwd: '<%=yeoman.dist%>/',
            src: ['config-gen.js', 'index.html', 'caleydo_web.js']
          }
        ]
      },
      package_python: {
        options: {
          archive: '<%=yeoman.dist%>/caleydo_python.tar.gz'
        },
        files: [
          { //copy the plugins
            expand: true,
            dot: true,
            src: ['plugins/**/*.{htaccess,webp,gif,js,css,png,jpg,svg,txt,htm,html,xhtml,ico,json,csv,tsv,py}', '!*/_**/*', '!plugins/caleydo_server_js/**']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            src: ['static/**/*', 'libs/bower_components/**/*']
          },
          { //copy scripts
            expand: true,
            dot: true,
            src: ['scripts/**/*', '!**/_*']
          },
          { //copy deployment specific stuff
            expand: true,
            dot: true,
            cwd: 'plugins/caleydo_server/_deploy',
            src: ['**/*']
          },
          { //copy deployment specific stuff
            expand: true,
            dot: true,
            cwd: '<%=yeoman.dist%>/',
            src: ['requirements.txt', 'debian.txt']
          }
        ]
      },
      package_js: {
        options: {
          archive: '<%=yeoman.dist%>/caleydo_js.tar.gz'
        },
        files: [
          { //copy the plugins
            expand: true,
            dot: true,
            src: ['plugins/**/*.{htaccess,webp,gif,js,css,png,jpg,svg,txt,htm,html,xhtml,ico,json,csv,tsv,py}', '!*/_**/*', '!plugins/caleydo_server/**']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            src: ['static/**/*', 'libs/bower_components/**/*']
          },
          { //copy scripts
            expand: true,
            dot: true,
            src: ['scripts/**/*', '!**/_*']
          },
          { //copy deployment specific stuff
            expand: true,
            dot: true,
            cwd: 'plugins/caleydo_server_js/_deploy',
            src: ['**/*']
          },
          { //copy deployment specific stuff
            expand: true,
            src: '<%=yeoman.dist%>/npm.package.json',
            rename: function (dest, src) {
              return 'package.json';
            }
          }
        ]
      }
    }
  });

  grunt.registerTask('compile', [
    'ts:dev',
    'sass:dev'
  ]);
  grunt.registerTask('server_common', [
    'clean:server',
    'compile']);

  grunt.registerTask('server_js', [
    'server_common',
    'express:debug',
    'watch'
  ]);
  grunt.registerTask('server', [
    'server_common',
    'bgShell:debug',
    'watch'
  ]);
  grunt.registerTask('dev', [
    'compile',
    'watch'
  ]);

  grunt.registerTask('package_common', [
    'clean:dist',
    'ts:dist',
    'sass:dist',
    'resolve_dependencies:dist'
    //TODO optimize the plugins by bundling them
  ]);
  grunt.registerTask('package_static', [
    'package_common',
    'bgShell:static',
    'compress:package_static'
  ]);
  grunt.registerTask('package_python', [
    'package_common',
    'compress:package_python'
  ]);
  grunt.registerTask('package_js', [
    'package_common',
    'compress:package_js'
  ]);
  grunt.registerTask('package', [
    'package_common',
    'bgShell:static',
    'compress:package_static',
    'compress:package_python',
    'compress:package_js'
  ]);

  grunt.registerTask('default', [
    'package_common',
    'tslint',
    'jshint',
    'bgShell:static',
    'compress:package_static',
    'compress:package_python',
    'compress:package_js'
  ]);

  grunt.registerMultiTask('resolve_dependencies', 'Resolves the dependencies from the current plugins and creates the type specific files', function () {

    var options = this.options({
      plugins: ['plugins/**/package.json'],
      target_dir : '.',
      target: {
        web: 'bower.json',
        node: 'npm.package.json',
        python: 'requirements.txt'
      },
      converter: {
        web: function (deps) {
          return JSON.stringify({
            name: 'caleydo-web',
            version: '0.0.1',
            dependencies: deps
          }, null, 2);
        },
        node: function (deps) {
          var ori = grunt.file.readJSON('./package.json');
          ori.dependencies = deps;
          return JSON.stringify(ori, null, 2);
        },
        debian: function (deps) {
          return Object.keys(deps).map(function (d) {
            return d + deps[d];
          }).join(' ')
        },
        tsd: function (deps) {
          return Object.keys(deps).map(function (d) {
            return d + ';' + deps[d];
          }).join('\n')+'\n'; //and a final last one
        },
        //suitable for python
        _default: function (deps) {
          return Object.keys(deps).map(function (d) {
            return d + deps[d];
          }).join('\n')
        }
      }
    });
    grunt.log.writeln(options.plugins);
    var dependencies = {};
    //var semver = require('semver');

    /**
     * merges a dependency list
     */
    function addDependency(type, deps) {
      if (type in dependencies) {
        var existing = dependencies[type];
        Object.keys(deps).forEach(function (d) {
          if (d in existing) {
            var new_ = deps[d],
                old = existing[d];
            if (old.indexOf(new_) >= 0) { //keep the old one
              //nothing to do
            } else { //merge
              existing[d] = old + ',' + new_;
            }
            grunt.log.writeln('resolving: ' + old + ' ' + new_ + ' to ' + existing[d]);
          } else {
            existing[d] = deps[d];
          }
        });
      } else {
        dependencies[type] = deps
      }
    }

    //parse all package.json files
    grunt.file.expand(options.plugins).forEach(function (plugin) {
      grunt.log.writeln(plugin);
      var desc = grunt.file.readJSON(plugin);
      if ('caleydo' in desc && 'dependencies' in desc.caleydo) {
        Object.keys(desc.caleydo.dependencies).forEach(function (type) {
          addDependency(type, desc.caleydo.dependencies[type]);
        });
      }
    });

    grunt.log.writeln(JSON.stringify(dependencies));

    //generate the dependency files
    Object.keys(dependencies).forEach(function (d) {
      var target = options.target_dir + '/'+(options.target[d] || d + '.txt');
      grunt.log.writeln(options.target_dir, target);
      var converter = options.converter[d] || options.converter._default;
      var r = converter(dependencies[d]);
      grunt.file.write(target, r);
    });
  });
};
