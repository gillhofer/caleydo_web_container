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
            src: ['<%=dynconfig.product.include%>/**/*', '!*/_*/**','!**/*.<%=dynconfig.exclude%>']
          },
          { //copy static stuff
            expand: true,
            dot: false,
            cwd: 'static/',
            dest: 'static/',
            src: ['**/*','!**/*.{scss,less,sass,map}','!{index.html,caleydo_web.js,caleydo_launcher.js}']
          },
          { //copy static stuff
            expand: true,
            dot: false,
            src: ['LICENSE']
          },
          { //copy the plugins
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            dest: 'static/',
            src: ['index.html', 'caleydo_web.js', 'caleydo_launcher.js']
          },
          { //copy bower_components
            expand: true,
            dot: true,
            dest: 'libs/',
            cwd: '<%=yeoman.tmp%>/',
            src: ['bower_components/**/*']
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
            src: ['<%=dynconfig.product.include%>/_deploy/**/*', '!**/_deploy/product.json']
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
        files: ['plugins/**/*.scss', 'static/**/*.scss'],
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
          src: ['plugins/**/*.scss', 'static/**/*.scss'],
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
          src: ['plugins/**/*.scss', 'static/**/*.scss'],
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
      server_js: '<%=yeoman.tmp%>/plugins/caleydo_server_js',
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
    dynconfig: {
      //dynamically set during execution
      product: {},
      exclude: '{ts,scss,map,pyc,sass,log,pot,swp,lock}'
    },
    bgShell: {
      options: {},
      debug: {
        cmd: 'python plugins/caleydo_server',
        bg: true,
        fail: true
      },
      npm: {
        cmd: 'npm --no-bin-links install',
        execOpts: {
          cwd: '<%=yeoman.tmp%>'
        },
        bg: false
      },
      bower: {
        cmd: 'bower --config.directory=./bower_components install',
        execOpts: {
          cwd: '<%=yeoman.tmp%>'
        },
        bg: false
      }
    },
    compress: {
      options: {
        archive: '<%=yeoman.dist%>/caleydo_<%=dynconfig.product.id%>.<%=dynconfig.product.package%>'
      },
      package_web: {
        files: [
          { //copy the plugins
            expand: true,
            dot: false,
            cwd: 'plugins',
            //copy plugins exclude common types and all directories starting with _
            src: ['<%=dynconfig.product.include%>/**/*', '!*/_*/**', '!**/*.<%=dynconfig.exclude%>']
          },
          { //copy static stuff
            expand: true,
            dot: false,
            cwd: 'static',
            dest: '.',
            src: ['**/*','!**/*.{scss,less,sass,map}','!{index.html,caleydo_web.js,caleydo_launcher.js}']
          },
          { //copy static stuff
            expand: true,
            dot: false,
            src: ['LICENSE']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            cwd: '<%=yeoman.tmp%>/bower_components',
            dest: 'bower_components',
            src: ['**/*','!**/*.{scss,less,sass,map}']
          },
          { //copy the plugins
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            dest: '.',
            src: ['index.html', 'caleydo_web.js', 'caleydo_launcher.js', 'bower.json']
          }
        ]
      },
      package_python: {
        files: common_copy_files.concat([
          { //copy deployment specific stuff
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            src: ['requirements.txt', 'debian.txt', 'config.json', 'bower.json', 'registry.json']
          }
        ])
      },
      package_js: {
        files: common_copy_files.concat([
          { //copy deployment specific stuff
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            src: ['config.json', 'debian.txt', 'package.json', 'bower.json', 'registry.json']
          }
        ])
      }
    }
  });

  grunt.registerTask('compile', [
    'ts:dev',
    'sass:dev'
  ]);
  grunt.registerTask('server_common', [
    'clean:server',
    'compile',
    'create_dynamic_files'
  ]);

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
    'create_dynamic_files',
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
    'create_registry',
    'all_product:web',
    'all_product:python',
    'package_product'
  ]);

  grunt.registerTask('build', 'Builds Caleydo Web', function(product) {
    if (product) {
      grunt.task.run(['package_common', 'create_registry', 'package_product:'+product]);
    } else {
      grunt.task.run(['default']);
    }
  });

  grunt.registerTask('create_registry', 'Creates the Caleydo Registry', function(product) {
    var done = this.async();

    var config = {
      debug: true,
      generate: {

      }
    };

    if (product) {
      config.default_app = grunt.config('dynconfig.product.app') || '_select';
      config.filter = grunt.config('dynconfig.product.include');
      config.generate.external_dependency_directory = grunt.config('yeoman.tmp');
      config.generate.registry_directory = grunt.config('yeoman.tmp');
      config.generate.html_directory = grunt.config('yeoman.tmp');
      config.dependencies = { target: { node: 'package.json' } };
      config.bower_components = grunt.config('yeoman.tmp')+'/bower_components';
      if (grunt.config('dynconfig.product.type') === 'web') {
        config.generate.main_relative_directory_url = '.';
      }
    }

    var caleydo_tool = require('caleydo_tool');
    caleydo_tool.parse(config).then(function(registry) {
      grunt.config.set(product ? 'dynconfig.product.registry' : 'dynconfig.registry',registry);
      done();
    }).error(function(error) {
      console.error(error);
    });
  });

  grunt.registerTask('create_dynamic_files', 'Creates the dynamic launcher files of Caleydo Web', function(product) {
    var done = this.async();
    var registry = grunt.config(product ? 'dynconfig.product.registry' : 'dynconfig.registry');
    registry.writeDynamicFiles().then(done);
  });

  grunt.registerTask('create_dynamic_dependencies', 'Creates the dynamic dependency files of Caleydo Web', function(product) {
    var done = this.async();
    var registry = grunt.config(product ? 'dynconfig.product.registry' : 'dynconfig.registry');
    registry.writeDependencyFiles().then(done);
  });

  grunt.registerTask('package_product', 'Packages all products', function(justProduct) {
    var registry = grunt.config('dynconfig.registry');

    var products = {};
    registry.products.forEach(function(product) {
      if (justProduct && justProduct !== product.id) {
        return;
      }
      var deps = product.plugins.map(function(d) { return d.id; });
      product.include = '{'+deps.join(',')+'}';
      products[product.id] = product;
    });
    //products contains a list of all elements to build
    grunt.config.set('dynconfig.products',products);
    grunt.task.run(['compile_products'])
  });

  grunt.registerTask('all_product', 'Generates a product of all known one', function(type) {
    var registry = grunt.config('dynconfig.registry');
    var options = this.options({
      type: type || 'python'
    });
    var deps = {};

    registry.plugins.forEach(function(plugin) {
      var extensions = plugin.extensions;
      if ((extensions[options.type] || extensions['web'])) {
        deps[plugin.id] = plugin;
      }
    });

    //console.log(Object.keys(deps));
    //check if we have all the dependencies assuming if there are some missing dependencies, we can't use it
    var removed = false;
    do {
      removed = false;
      Object.keys(deps).forEach(function(id) {
        var anymissing = deps[id].flatDeps.some(function(dep) { return !(deps[dep.id]); });
        if (anymissing) {
          removed = true;
          delete deps[id];
        }
      });
    } while (removed);

    //create a pseudo product
    var matching_ids = Object.keys(deps);
    //console.log(matching_ids);
    var matching_plugins = matching_ids.map(function (p) { return deps[p]; });

    var product = {
      id: 'all_'+options.type,
      name: 'all_'+options.type,
      description: '',
      type: options.type,
      package: options.type === 'web' ? 'zip': 'tar.gz',
      app: '_select',
      plugins: matching_plugins,
      include : '{'+matching_ids.join(',')+'}'
    };

    //products contains a list of all elements to build
    var products = {};
    products[product.id] = product;

    grunt.config.set('dynconfig.products',products);

    grunt.task.run(['compile_products'])
  });

  grunt.registerTask('compile_products', 'Compiles the product and generates the tasks list', function() {
    var products = grunt.config('dynconfig.products');
    var tasks = [].concat.apply([], Object.keys(products).map(function(name) {
      var product = products[name];
      var r = [];
      //0. clean up
      r.push('clean:product:'+name);
      //1. set task for product
      r.push('prepare_product:'+name);
      //3. create product registry
      r.push('create_registry:'+name);
      //4. create dependency files
      r.push('create_dynamic_dependencies:'+name);
      //3. generate bower dependencies
      r.push('bgShell:bower:'+name);
      //4. create dynamic files
      r.push('create_dynamic_files:'+name);
      //4. generate the package
      r.push('compress:package_'+product.type+':'+name);
      //5. clean up
      r.push('clean:product:'+name);
      return r;
    }));
    //run the aggregated tasks
    grunt.task.run(tasks);
  });

  grunt.registerTask('prepare_product', 'Prepares the product to package', function(name) {
    var product = grunt.config('dynconfig.products.'+name);
    grunt.config.set('dynconfig.product',product);
  });
};
