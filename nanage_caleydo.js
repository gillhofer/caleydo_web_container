/**
 * Created by Samuel Gratzl on 21.09.2015.
 */

var fs = require('fs'),
    Q = require('q'),
    extend = require('dextend');

function guessRepo(name, baseRepo) {
  if (!baseRepo || baseRepo.match(/Caleydo\/.*/) || name.match(/caleydo.*/)) {
    return 'Caleydo/' + name;
  }
  return baseRepo.split('/')[0] + '/' + name
}

function replace_variables_f(config, lookup) {
  return config.replace(/\$\{([^}]+)\}/gi, function (match, variable) {
    var r = lookup(variable);
    if (r) {
      return r;
    }
    console.log('cant resolve: ${' + variable + '}');
    return "$unresolved$";
  });
}
function replace_variables(config, vars) {
  return replace_variables_f(config, function (variable) {
    return vars.hasOwnProperty(variable) ? vars[variable] : null;
  });
}

function unpack_eval(config) {
  return config.replace(/"eval!(.*)"/gi, function (match, code) {
    return code;
  });
}

/**
 * a plugin is the abstraction of a Caleydo plugins
 * @param plugindir directory of plugins
 * @param p the id
 * @param desc the package json description structure
 * @constructor
 */
function Plugin(plugindir, p, desc) {
  this.id = p;
  this.name = desc.name || p;
  this.version = desc.version || '0.0.1';
  this.description = desc.description || '';
  this.folder = plugindir + '/' + p;
  this.folder_name = p;
  this.repository = desc.repository;
  this.dependencies = desc.peerDependencies;
  this.deps = [];
  this.extensions = {};
}
Object.defineProperty(Plugin.prototype, 'depRepos', {
  enumerable: true,
  get: function () {
    var that = this,
        r = {};
    this.deps.forEach(function (dep) {
      r[dep.id] = guessRepo(dep.id, that.repository);
    });
    return r;
  }
});
Object.defineProperty(Plugin.prototype, 'flatDeps', {
  enumerable: true,
  get: function () {
    var cache = {}, r = [];

    function addAll(p) {
      p.deps.forEach(function (dep) {
        if (dep.id in cache) {
          //ok
        } else {
          r.push(dep.id);
          cache[dep.id] = true;
          addAll(dep.deps);
          //recur
        }
      });
    }

    addAll(this);
    return r;
  }
});
Object.defineProperty(Plugin.prototype, 'isApp', {
  enumerable: true,
  get: function () {
    return fs.existsSync(this.folder + '/index.html');
  }
});

function PluginMetaData(config) {
  this.config = extend({
    dir: './',
    metadata_file: '/package.json',
    bower_components: 'libs/bower_components',
    startApp: '_select',
    bower_components_url: '/bower_components'
  }, config);

  this.plugins = [];
  this.extensions = {};
  this.products = [];
  this.dependencies = {};

  this.ignoredBoweredDependencies = [];

  this.requirejs_config = {
    paths: {},
    map: {},
    config: {}
  };
  this._bower_configs = {};
}

PluginMetaData.prototype.getPlugin = function (id) {
  return this.plugins.filter(function (d) {
    return d.id === id;
  })[0];
};

PluginMetaData.prototype.addExtension = function (category, plugins, plugin_desc) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  if (!(category in plugin_desc.extensions)) {
    plugin_desc.extensions[category] = [];
  }
  if (!(category in this.extensions)) {
    this.extensions[category] = [];
  }

  function fill(p) {
    return extend({
      folder: plugin_desc.folder_name,
      id: plugin_desc.id,
      version: plugin_desc.version,
      name: plugin_desc.name
    }, p);
  }
  var a = plugins.map(fill);
  this.extensions[category].push.apply(this.extensions[category],a);
  plugin_desc.extensions[category].push.apply(plugin_desc.extensions[category],a);
};

PluginMetaData.prototype.addDependency = function (type, deps) {
  if (type in this.dependencies) {
    var existing = this.dependencies[type];
    Object.keys(deps).forEach(function (d) {
      if (d in existing) {
        var new_ = deps[d],
            old = existing[d];
        if (old.indexOf(new_) >= 0) { //keep the old one
          //nothing to do
        } else { //merge
          existing[d] = old + ',' + new_;
        }
        console.log('resolving: ' + old + ' ' + new_ + ' to ' + existing[d]);
      } else {
        existing[d] = deps[d];
      }
    });
  } else {
    this.dependencies[type] = deps
  }
};

PluginMetaData.prototype.addProduct = function (products, plugin) {
  if (!Array.isArray(products)) {
    products = [products];
  }

  function fill(p) {
    return extend({
      name: plugin.name,
      description: plugin.description,
      type: 'python',
      package: 'tar.gz',
      app: plugin.isApp ? plugin.id : '_select',
      plugins: [ plugin.id ],
      base: plugin
    }, p);
  }

  this.products.push.apply(this.products, products.map(fill));
};

PluginMetaData.prototype._add_requirejs_config = function (rconfig, dir) {
  extend(this.requirejs_config, rconfig);
};

PluginMetaData.prototype._config_requirejs_bower = function (rconfig, dir) {
  if (rconfig.ignore) {
    this.ignoredBoweredDependencies.push.apply(this.ignoredBoweredDependencies, rconfig.ignore);
  }
};

PluginMetaData.prototype.loadJustPlugin = function (plugindir, dir) {
  var deferred = Q.defer();
  var metadata_file_abs = plugindir + dir + this.config.metadata_file;
  fs.readFile(metadata_file_abs, function (err, data) {
    if (err) {
      console.error('cant parse ' + metadata_file_abs, err);
      deferred.reject(new Error(err));
      return;
    }
    return new Plugin(plugindir, dir, JSON.parse(data));
  });
  return deferred.promise;
};

PluginMetaData.prototype.addPlugin = function (plugindir, dir) {
  var deferred = Q.defer();
  var metadata_file_abs = plugindir + dir + this.config.metadata_file;
  console.log('add plugin ' + metadata_file_abs);
  var that = this;
  fs.readFile(metadata_file_abs, function (err, data) {
    if (err) {
      console.error('cant parse ' + metadata_file_abs, err);
      deferred.reject(new Error(err));
      return;
    }
    var metadata = JSON.parse(data);
    var p = new Plugin(plugindir, dir, metadata);
    that.plugins.push(p);

    if (metadata.hasOwnProperty('caleydo')) { //caleydo magic entry
      var c = metadata.caleydo;

      if (c.plugins) { //for all extensions
        Object.keys(c.plugins).forEach(function (category) {
          that.addExtension(category, c.plugins[category], p);
        });
      }
      if (c.dependencies) { //for all dependencies
        Object.keys(c.dependencies).forEach(function (category) {
          that.addDependency(category, c.dependencies[category]);
        });
      }

      //special config settings
      if (c['requirejs-config']) {
        that._add_requirejs_config(c['requirejs-config'], dir);
      }
      if (c['requirejs-bower']) {
        that._config_requirejs_bower(c['requirejs-bower'], dir);
      }
    }
    deferred.resolve(that);
  });
  return deferred.promise;
};

PluginMetaData.prototype.parseDir = function (plugindir) {
  console.log('start parsing ' + plugindir);
  var deferred = Q.defer();
  var that = this;
  fs.readdir(plugindir, function (err, files) {
    if (typeof files === 'undefined') {
      deferred.resolve(that);
      return;
    }
    //map pluginDir to promise function and execute them
    files.map(function (f) {
      return function () {
        var d = Q.defer();
        //valid plugin?
        fs.stat(plugindir + '/' + f + '/' + that.config.metadata_file, function (err, stats) {
          if (stats && stats.isFile()) {
            d.resolve(that.addPlugin(plugindir, f));
          } else {
            d.resolve(f);
          }
        });
        return d.promise;
      };
    }).reduce(Q.when, Q.resolve(that)).then(function () {
      //ok directory done
      deferred.resolve(that);
    });
  });
  return deferred.promise.then(PluginMetaData.prototype.postParse);
};

/**
 * parses the given repositories returning a promise when done
 * @param pluginDirs
 * @returns {*}
 */
PluginMetaData.prototype.parseDirs = function (pluginDirs) {
  var that = this;
  //wait for all
  return pluginDirs.map(function (pluginDir) {
    return function () {
      return that.parseDir(that.config.dir + pluginDir);
    };
  }).reduce(Q.when, Q.resolve(that));
};

PluginMetaData.prototype.postParse = function (that) {
  //resolve the plugin mutual plugin dependencies
  var plugins = {};
  that.plugins.forEach(function (p) {
    plugins[p.id] = p;
  });
  that.plugins.forEach(function (p) {
    Object.keys(plugins.dependencies).forEach(function (dep) {
      var impl = plugins[dep];
      if (!impl) {
        console.warn('cant resolve dependency: ' + dep + ' of plugin ' + p.id);
      } else {
        p.deps.push(impl);
      }
    });
  });
  return that;
};


/**
 * generates the dependency files and writes them, e.g. bower.json
 **/
PluginMetaData.prototype.generateDependencyFiles = function (targetDir) {
  var options = this.options.dependencies;
  //generate the dependency files
  Object.keys(this.dependencies).forEach(function (d) {
    var target = targetDir + '/' + (options.target[d] || d + '.txt');
    var converter = options.converter[d] || options.converter._default;
    var r = converter(dependencies[d]);
    fs.writeFileSync(target, r);
  });
};

PluginMetaData.prototype.createAppSelector = function () {
  //generate a list of all known one
  var text = ['<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title>Caleydo Web Apps</title></head><body><h1>Caleydo Web Apps</h1><ul>'];
  this.plugins.filter(function (p) {
    return p.isApp;
  }).forEach(function (app) {
    text.push('<li><a href="/' + app.id + '/">' + app.name + '</a></li>');
  });
  text.push('</li></body></html>');
  return text.join('\n');
};

PluginMetaData.prototype.createRedirect = function (app) {
  var text = ['<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title>Caleydo Web Redirect</title><meta http-equiv="refresh" content="0; url=',
    app.id,
    '/"></head><body><h1>Caleydo Web Redirect</h1>',
    'Goto <a href=',
    app.id,
    '/">',
    app.name,
    '</a></body></html>'
  ];
  return text.join('\n');
};

//index.html
PluginMetaData.prototype.createStartHTML = function () {
  if (this.options.startApp && this.options.startApp !== '_select') {
    var app = this.options.startApp,
        plugin = this.plugins.filter(function (p) {
          return p.id === app
        })[0];
    if (plugin) {
      return this.createRedirect(plugin);
    }
  }
  return this.createAppSelector();
};

//caleydo_web.js
PluginMetaData.prototype.createStartScript = function () {
  //<script data-app='./main' data-context='/' src='/caleydo_web.js"></script>

  //<script data-main="/config-gen.js" src="/bower_components/requirejs/require.js"></script>
  var base = "(function() {{ \
    var app = document.currentScript.dataset.app; \n\
    app = app ? '/?app='+app : ''\
    var context = document.currentScript.dataset.context || ''; \n\
    var newScript = document.createElement('script'); \n\
    newScript.type = 'text/javascript'; \n\
    newScript.src = context+'" + this.config.bower_components_url + "/requirejs/require.js'; \n\
    newScript.dataset.main = context+'/caleydo_launcher.js'+app;\n\
    document.getElementsByTagName('head')[0].appendChild(newScript); \n\
    ; \
  }}())";
  return base;
};

PluginMetaData.prototype.addBowerRequireJSConfig = function (dir, scripts, cssfiles) {
  var deferred = Q.defer();
  var metadata_file_abs = this.config.dir + this.config.bower_components + '/' + dir + '/.bower.json';
  console.log('add bower dependency ' + metadata_file_abs);
  fs.readFile(metadata_file_abs, function (err, data) {
    var metadata, script, value;
    if (err) {
      console.error('cant parse ' + metadata_file_abs, err);
      deferred.resolve(new Error(err)); //not an error continue
      return;
    }
    metadata = JSON.parse(data);
    script = metadata.main;
    if (Array.isArray(script)) {
      script = script[0]; //take the first one
      //TODO multiple support
    }
    if (script && script.match(/.*\.js$/i)) {
      scripts[dir] = dir + '/' + script.substring(0, script.length - 3);
    } else if (script && script.match(/.*\.css$/i)) {
      cssfiles[dir] = dir + '/' + script.substring(0, script.length - 4);
    }
    deferred.resolve(dir);
  });
  return deferred.promise;
};

PluginMetaData.prototype.deriveBowerRequireJSConfig = function () {
  var that = this;
  console.log('derive bower config');
  var deferred = Q.defer();
  var scripts = {},
      cssfiles = {};
  fs.readdir(this.config.dir + this.config.bower_components, function (err, files) {
    console.log(err);
    var i = 0, l = files.length;

    function next() {
      if (i < l) {
        var f = files[i++];
        if (that.ignoredBoweredDependencies.indexOf(f) >= 0) {
          next();
        } else {
          that.addBowerRequireJSConfig(f, scripts, cssfiles).then(next);
        }
      } else {
        that._bower_configs = {scripts: scripts, cssfiles: cssfiles};
        deferred.resolve(that);
      }
    }

    next();
  });
  return deferred.promise;
};


//caleydo_launcher.js
PluginMetaData.prototype.createLauncherScript = function () {
  var that = this,
      baseUrl = '%baseUrl%';
  this.deriveBowerRequireJSConfig().then(function () {
    var c = {
      baseUrl: baseUrl,
      paths: {},
      map: {},
      config: {}
    };
    //extend with the stored one
    c = extend(c, this.requirejs_config);

    //inject bower dependencies
    var that = this;
    Object.keys(this._bower_configs.scripts).forEach(function (d) {
      var script = that._bower_configs.scripts[d];
      c['paths'][d] = baseUrl + that.config.bower_components_url + '/' + script;
    });
    Object.keys(this._bower_configs.cssfiles).forEach(function (d) {
      var css = that._bower_configs.cssfiles[d];
      c['map']['*'][d] = c['map']['*']['css'] + '!' + baseUrl + that.config.bower_components_url + '/' + css;
    });

    c = JSON.stringify(c, null, ' ');
    var variables = {
      'baseUrl': baseUrl + that.config.bower_components_url
    };
    c = replace_variables(c, variables);
    c = unpack_eval(c);
    c = c.replace(/%baseUrl%/, '"+context+"');

    var web_plugins = JSON.stringify(that.extensions.web || [], null, ' ');

    return "/*global require */\n \(\
    function() { \
    var app = document.querySelector('script[data-app]'); \n\
    app = app ? app.dataset.app : './main'; \n\
    var context = document.querySelector('script[data-context]'); \n\
    context = context ? context.dataset.context : ''; \n\
    \
    require.config(" + c + "); \n\
    require([context+'/caleydo_core/main'], function(C) { \n\
      //init the core at the beginning \n\
      C._init({ \n\
        registry: { \n\
          baseUrl: context,\
          plugins: " + web_plugins + "\n\
        } \n\
      }); \n\
      //request the real main file \n\
      require([app]);\n\
    });\
  }())";
  });
};

PluginMetaData.prototype.writeDynamicFiles = function (targetDir) {
  var that = this;
  return this.createLauncherScript().then(function (code) {
    fs.writeFileSync(targetDir + '/caleydo_launcher.js', code);
    fs.writeFileSync(targetDir + '/caleydo_web.js', that.createStartScript());
    fs.writeFileSync(targetDir + '/index.html', that.createStartHTML());
    that.generateDependencyFiles(targetDir);

    fs.writeFileSync(targetDir + '/registry.json', JSON.stringify(that.extensions, null, ' '));
  });
};

exports.parse = function (config) {
  var p = new PluginMetaData(config);
  return p.parseDirs(config.directories || ['./plugins']);
};

if (require.main === module) {
  var program = require('commander')
      .option('--source <source>', 'specify source dir', './')
      .option('--bower <bower>', 'specify source relative bower directory', 'libs/bower_components')
      .option('--bower_url <bower_url>', 'bower url at runtime', '/bower_components')
      .option('--target <target>', 'specify target dir', '.')
      .option('--default <default>', 'specify default app', null);

  function createReg() {
    return exports.parse({
      dir: program.source,
      bower_components: program.bower,
      bower_components_url: program.bower_url,
      startApp: program.default
    });
  }

  function parsePlugin(plugin) {
    var p = new PluginMetaData({
      dir: program.source,
      bower_components: program.bower,
      bower_components_url: program.bower_url,
      startApp: program.default
    });
    return p.loadJustPlugin('./plugins', plugin);
  }

  program.command('gen').action(function () {
    createReg().then(function (registry) {
      registry.writeDynamicFiles(program.target)
    });
  });

  program.command('catRepo <plugin>').action(function (plugin) {
    parsePlugin(plugin).then(function (p) {
      console.log(p.repository);
    });
  });

  program.command('catDependencies <plugin>').action(function (plugin) {
    parsePlugin(plugin).then(function (p) {
      Object.keys(p.dependencies).forEach(function (dep) {
        console.log(dep + ';' + guessRepo(dep, p.repository));
      });
    });
  });

  program.command('list').action(function () {
    createReg().then(function (registry) {
      registry.plugins.forEach(function (p) {
        console.log(p.id + ';' + p.name);
      })
    })
  });

  program.parse(process.argv);

}