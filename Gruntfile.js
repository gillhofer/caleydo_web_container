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

  var common_copy_files = [
          { //copy the plugins
            expand: true,
            dot: false,
            cwd: 'plugins/',
            dest: 'plugins/',
            src: ['<%=dynconfig.plugins.include%>/**/*', '!*/_*/**','!**/*.<%=dynconfig.exclude%>']
          },
          { //copy bower_components
            expand: true,
            dot: false,
            dest: 'libs/',
            cwd: '<%=yeoman.tmp%>/',
            src: ['bower_components/**/*']
          },
          { //copy static stuff
            expand: true,
            dot: false,
            src: ['static/**/*','LICENSE']
          },
          { //copy scripts
            expand: true,
            dot: false,
            src: ['scripts/**/*', '!**/_*']
          },
          { //copy deployment specific stuff
            expand: true,
            dot: false,
            flatten: true,
            cwd: 'plugins/',
            src: ['<%=dynconfig.plugins.include%>/_deploy/**/*', '!**/_deploy/product.json']
          }
        ];

  grunt.config.init({
    // configurable paths
    yeoman: {
      // configurable paths
      app: 'plugins',
      dist: '_dist',
      deploy: '_deploy',
      doc: '_doc',
      tmp: '_tmp'
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
              '.tmp','<%=yeoman.tmp%>',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp',
      product: '<%=yeoman.tmp%>'
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
    dynconfig: {
      //dynamically set during execution
      product: '',
      extension: 'zip',
      plugins: {
        include: ''
      },
      exclude: '{ts,scss,map,pyc,sass,log,pot,swp,lock}'
    },
    resolve_dependencies: {
      dist: {
        options: {
          target_dir: '<%= yeoman.tmp %>'
        }
      },
      product: {
        options: {
          target_dir: '<%= yeoman.tmp %>',
          plugins: 'plugins/<%=dynconfig.plugins.include%>/**/package.json'
        }
      },
      dev: {

      }
    },
    compress: {
      options: {
        archive: '<%=yeoman.dist%>/caleydo_<%=dynconfig.product%>.<%=dynconfig.extension%>'
      },
      package_static: {
        files: [
            { //copy the plugins
              expand: true,
              dot: false,
              cwd: 'plugins',
              //copy plugins exclude common types and all directories starting with _
              src: ['<%=dynconfig.plugins.include%>/**/*', '!*/_**/*', '!**.<%=dynconfig.exclude%>']
            },
            { //copy static stuff
              expand: true,
              dot: false,
              cwd: 'static',
              dest: '.',
              src: ['**/*']
            },
            { //copy static stuff
              expand: true,
              dot: false,
              cwd: '<%=yeoman.tmp%>/bower_components',
              dest: 'bower_components',
              src: ['**/*']
            },
            { //copy dumped generated files
              expand: true,
              dot: false,
              cwd: '<%=yeoman.tmp%>/',
              src: ['config-gen.js', 'index.html', 'caleydo_web.js']
            }
          ]
      },
      package_python: {
        files: common_copy_files.concat([
          { //copy deployment specific stuff
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            src: ['requirements.txt', 'debian.txt', 'config.json']
          }
        ])
      },
      package_js: {
        files: common_copy_files.concat([
          { //copy deployment specific stuff
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            src: ['config.json']
          },
          { //copy deployment specific stuff
            expand: true,
            src: '<%=yeoman.tmp%>/npm.package.json',
            rename: function (dest, src) {
              return 'package.json';
            }
          }
        ])
      }
    },
    package_product: {
      options: {
        products: ['plugins/*/_deploy/product.json']
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
    'sass:dist'
  ]);

  grunt.registerTask('default', [
    'package_common',
    'tslint',
    'jshint',
    'package_product'
  ]);

  grunt.registerTask('package_product', 'Packages all products', function(justProduct) {
    var options = this.options({
      products: ['plugins/**/_deploy/product.json']
    });
    var path = require('path');
    var products = {};
    grunt.file.expand(options.products).forEach(function (product) {
      var desc = grunt.file.readJSON(product);
      var package_json = grunt.file.readJSON(path.join(path.dirname(product),'../package.json'));
      var plugin_name = path.basename(path.dirname(path.dirname(product)));

      //default options
      desc.name = desc.name || package_json.name || plugin_name;
      desc.description = desc.description || package_json.description || '';
      desc.package = desc.package || 'tar.gz';
      desc.type = desc.type || 'static';
      desc.app = desc.app || plugin_name;
      desc.plugins = desc.plugins || [ plugin_name ];

      if (justProduct && justProduct !== desc.name) {
        return;
      }
      products[desc.name] = desc;
    });

    //products contains a list of all elements to build
    grunt.config.set('dynconfig.products',products);
    var tasks = [].concat.apply([], Object.keys(products).map(function(name) {
      var product = products[name];
      var r = [];
      //0. clean up
      r.push('clean:product');
      //1. set task for product
      r.push('prepare_product:'+name);
      //2. resolve its dependencies
      r.push('resolve_dependencies:product');
      //[3. generate the dump files]
      if (product.type === 'static') {
        //TODO use the js server for dumping - less dependencies, i.e. no python ones
        //install the npm.package dependencies
        //run the js server to dump the needed files
      }
      //4. generate bower dependencies
      r.push('install_tmp_bower');
      //5. generate the package
      r.push('compress:package_'+product.type);
      return r;
    }));
    //run the aggregated tasks
    grunt.task.run(tasks);
  });

  grunt.registerTask('prepare_product', 'Prepares the product to package', function(name) {
    var product = grunt.config('dynconfig.products.'+name);
    grunt.config.set('dynconfig.product',name);
    grunt.config.set('dynconfig.extension',product.package);
    var plugins = resolvePeerDependencies(product.plugins);
    grunt.config.set('dynconfig.plugins.include','{'+plugins.join(',')+'}');
    //tasks
    if (product.app && product.app !== '_select') {
      //generate the index redirect
      grunt.file.write(grunt.config.process('<%=yeoman.tmp%>/config.json'), JSON.stringify({
        'caleydo_core': {
          'default_app' : product.app
        }
      }, null, 1));
    }

    function resolvePeerDependencies(plugins) {

      var queue = plugins.slice(),
          next = null,
          result = [];
      while (next = queue.shift()) {
        if (result.indexOf(next) >= 0) {
          continue; //already resolved
        }
        result.push(next); //resolved
        var package_json = grunt.file.readJSON('plugins/'+next+'/package.json');
        //push all dependencies
        queue.push.apply(queue, Object.keys(package_json.peerDependencies || {}));
      }
      return result;
    }
  });

  grunt.registerTask('install_tmp_bower', 'Installs the tmp bower dependencies', function() {
    var options = this.options({
      cwd: grunt.config.process('./<%=yeoman.tmp%>')
    });
    grunt.log.writeln('running bower...');
    // Force task into async mode and grab a handle to the "done" function.
    var done = this.async();
    grunt.util.spawn({
      cmd: 'bower',
      opts: {
        cwd: options.cwd
      },
      args: [ '--config.directory=./bower_components', 'install']
    }, function(error, result, code) {
      grunt.log.writeln(String(result));
      done();
    });
  });

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
