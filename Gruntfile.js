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
          { //copy the plugins
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            dest: 'plugins/',
            src: ['index.html', 'caleydo_web.js', 'caleydo_launcher.js']
          },
          { //copy bower_components
            expand: true,
            dot: true,
            dest: 'libs/',
            cwd: '<%=yeoman.tmp%>/',
            src: ['bower_components/**/*']
          },
          { //copy static stuff
            expand: true,
            dot: false,
            src: ['static/**/*','!**/*.{scss|map,less,sass,map}', 'LICENSE']
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
    resolve_dependencies: {
      product: {
        options: {
          plugins: 'plugins/<%=dynconfig.plugins.resolve%>/**/package.json',
          node_no_devdependencies: true
        }
      },
      dev: {

      }
    },
    copy: {
      web: {
        files: [
          { //copy the plugins
            expand: true,
            dot: false,
            cwd: 'plugins/',
            dest: '<%=yeoman.tmp%>/plugins/',
            src: ['<%=dynconfig.product.resolve%>/**/*', '!*/_*/**','!**/*.<%=dynconfig.exclude%>']
          }
        ]
      }
    },
    compress: {
      options: {
        archive: '<%=yeoman.dist%>/caleydo_<%=dynconfig.product.id%>.<%=dynconfig.extension%>'
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
            src: ['**/*','!**/*.{scss|map}']
          },
          { //copy static stuff
            expand: true,
            dot: true,
            cwd: '<%=yeoman.tmp%>/bower_components',
            dest: 'bower_components',
            src: ['**/*','!**/*.{scss|map,less,sass,map}']
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
            src: ['requirements.txt', 'debian.txt', 'config.json', 'bower.json']
          }
        ])
      },
      package_js: {
        files: common_copy_files.concat([
          { //copy deployment specific stuff
            expand: true,
            dot: false,
            cwd: '<%=yeoman.tmp%>/',
            src: ['config.json', 'debian.txt', 'package.json', 'bower.json']
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

  grunt.registerTask('create_registry', 'Creates the Caleydo Registry', function() {
    var done = this.async();
    require('caleydo_tool/caleydo').parse({}).then(function(registry) {
      grunt.config.set('dynconfig.registry',registry);
      done();
    });
  });

  grunt.registerTask('create_dynamic_files', 'Creates the dynamic files of Caleydo Web', function(product) {
    var done = this.async();
    var config = {
      startApp: grunt.option('dynconfig.product.app') || '_select',
      targetDir : '.',
      targetHTMLDir : './static'
    };
    if (product) {
      config.dir = grunt.config('yeoman.tmp');
      config.targetDir = grunt.config('yeoman.tmp');
      config.targetHTMLDir = grunt.config('yeoman.tmp');
      config.bower_components = grunt.option('dynconfig.product.type') === 'web' ? './bower_components' : './libs/bower_components';
    }
    require('caleydo_tool/caleydo').parse(config).then(function(registry) {
      return registry.writeDynamicFiles(config.targetDir, config.targetHTMLDir);
    }).then(done);
  });

  grunt.registerTask('package_product', 'Packages all products', function(justProduct) {
    var registry = grunt.config('dynconfig.registry');

    var products = {};
    registry.products.forEach(function(product) {
      if (justProduct && justProduct !== product.id) {
        return;
      }
      var deps = product.base.flatDeps.map(function(d) { return d.id; });
      product.include = '{'+deps.join(',')+'}';
      product.resolve = '{'+deps.join(',')+'}';
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
    var done = this.async();
    //FIXME
    var deps = {};

    var matching_plugins = registry.plugins.filter(function(plugin) {
      var extensions = plugin.extensions;
      if (extensions[options.type] || extensions['web']) {
        plugin.flatDeps.forEach(function(dep) {
          deps[dep.id] = true;
        });
        return true;
      }
      return false;
    });

    //create a pseudo product

    deps = Object.keys(deps);

    var product = {
      id: 'all_'+options.type,
      name: 'all_'+options.type,
      description: '',
      type: options.type,
      app: '_select',
      plugins: matching_plugins.map(function(d) { return d.i}),
      include : '{'+deps.join(',')+'}',
      resolve : '{'+deps.join(',')+'}'
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
      //2. resolve its dependencies
      r.push('resolve_dependencies:product:'+name);
      //3. generate bower dependencies
      r.push('bgShell:bower:'+name);
      //4. generate the dump files
      r.push('create_dynamic_files:'+name);
      //5. generate the package
      r.push('compress:package_'+product.type+':'+name);
      //6. clean up
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
