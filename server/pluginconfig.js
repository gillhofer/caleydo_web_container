/**
 * Created by Samuel Gratzl on 10.10.2014.
 */

var fs = require('fs');
var Q = require('q');

var bower_file = 'bower.json';
var bower_components_url = '/bower_components';
var bower_components = 'bower_components';
var metadata_file = '/package.json';

function PluginConfig(config) {
  this.config_file = 'plugins/config-gen.js';
  this.bower_dependencies = {
    requirejs: '~2.1.8',
    'require-css': '~0.1.5'
  };
  this.ignoredBoweredDependencies = ['requirejs', 'require-css'];

  this.caleydo_plugins = [];
  this.requirejs_config = {
    baseUrl: config.baseUrl,
    paths: {},
    map: {
      '*': {
        'css': '${baseUrl}/require-css/css.js' // or whatever the path to require-css is
      }
    },
    deps: [config.mainFile],
    config: { }
  };
  this.requirejs_config.config[config.configPrefix + 'caleydo/main'] = {
    apiUrl: config.apiPrefix,
    apiJSONSuffix: config.apiSuffix
  };
  this.requirejs_config.config[config.configPrefix + 'caleydo/plugin'] = {
    baseUrl: config.baseUrl,
    plugins: this.caleydo_plugins
  };
}

//see https://github.com/vladmiller/dextend/blob/master/lib/dextend.js
var TYPE_OBJECT = '[object Object]';

function extend(target) {
  var i, j, toMerge, keyName, value, keys;
  var result = null;
  for (i = 0; i < arguments.length; i++) {
    toMerge = arguments[i];
    keys = Object.keys(toMerge);
    if (result === null) {
      result = toMerge;
      continue;
    }
    for (j = 0; j < keys.length; j++) {
      keyName = keys[j];
      value = toMerge[keyName];
      if (Object.prototype.toString.call(value) == TYPE_OBJECT) {
        if (result[keyName] === undefined) {
          result[keyName] = {};
        }
        result[keyName] = extend(result[keyName], value);
      } else if (Array.isArray(value)) {
        if (result[keyName] === undefined) {
          result[keyName] = [];
        }
        result[keyName] = value.concat(result[keyName]);
      } else {
        result[keyName] = value;
      }
    }
  }
  return result;
}

function replaceVariables(config) {
  var vars = {
    baseUrl: bower_components_url
  };
  return config.replace(/\$\{(.*)\}/gi, function (match, variable) {
    if (vars.hasOwnProperty(variable)) {
      return vars[variable];
    }
    console.log('cant resolve: ${' + variable + '}');
    return "$unresolved$";
  });
}

function unpackEval(config) {
  return config.replace(/"eval!(.*)"/gi, function (match, code) {
    return code;
  });
}

function resolveConfig(config) {
  config = replaceVariables(config);
  config = unpackEval(config);
  return config;
}

function createConfigFile(config_obj) {
  var config = JSON.stringify(config_obj, null, 2);
  config = resolveConfig(config);
  var config_full = '/*global require */\r\nrequire.config(' +
    config +
    ');';
  return config_full;
}

PluginConfig.prototype.dumpConfig = function (that) {
  var deferred = Q.defer();
  var config_full = createConfigFile(that.requirejs_config);
  fs.writeFile(that.config_file, config_full, function (err) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      console.log(that.config_file + ' saved');
      deferred.resolve(config_full);
    }
  });
  return deferred.promise;
};

PluginConfig.prototype.addCaleydoPlugins = function (plugins) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  //TODO extend with default metadata stuff
  this.caleydo_plugins.push.apply(this.caleydo_plugins, plugins);
};

PluginConfig.prototype.addDependencies = function (dependencies, dir) {
  extend(this.bower_dependencies, dependencies);
};

PluginConfig.prototype.addRequireJSConfig = function (rconfig, dir) {
  extend(this.requirejs_config, rconfig);
};

PluginConfig.prototype.configRequireJSBower = function (rconfig, dir) {
  if (rconfig.ignore) {
    this.ignoredBoweredDependencies.push.apply(this.ignoredBoweredDependencies, rconfig.ignore);
  }
};

PluginConfig.prototype.addPlugin = function (plugindir, dir) {
  var deferred = Q.defer();
  var metadata_file_abs = plugindir + '/' + dir + metadata_file;
  console.log('add plugin ' + metadata_file_abs);
  var that = this;
  fs.readFile(metadata_file_abs, function (err, data) {
    if (err) {
      console.error('cant parse ' + metadata_file_abs, err);
      deferred.reject(new Error(err));
      return;
    }
    var metadata = JSON.parse(data);
    if (metadata.dependencies) {
      that.addDependencies(metadata.dependencies, dir);
    }
    if (metadata.hasOwnProperty('caleydo')) {
      var c = metadata.caleydo;
      if (c.plugins) {
        that.addCaleydoPlugins(c.plugins);
      }
      if (c['requirejs-config']) {
        that.addRequireJSConfig(c['requirejs-config'], dir);
      }
      if (c['requirejs-bower']) {
        that.configRequireJSBower(c['requirejs-bower'], dir);
      }
    }
    deferred.resolve(that);
  });
  return deferred.promise;
};

PluginConfig.prototype.dumpBower = function (that) {
  console.log('dump bower');
  var deferred = Q.defer();
  fs.readFile(bower_file, function (err, data) {
    if (err) {
      deferred.reject(new Error(err));
    }
    var bower = JSON.parse(data);
    bower.dependencies = that.bower_dependencies;
    fs.writeFile(bower_file, JSON.stringify(bower, null, 2), function (err) {
      if (err) {
        throw err;
      }
      console.log(bower_file + ' saved');
      deferred.resolve(that);
    });
  });
  return deferred.promise;
};

PluginConfig.prototype.runBower = function (that) {
  console.log('run bower');
  var deferred = Q.defer();
  var bower = require('bower');
  var cli = require('bower/lib/util/cli');

  //copied from bower/bin/bower
  var logger = bower.commands.install.line(['node', 'bower.js']);
  var renderer = cli.getRenderer('install', logger.json, bower.config);

  logger
    .on('end', function (data) {
      console.error('done');
      renderer.end(data);
      console.log('ran bower');
      deferred.resolve(that);
    })
    .on('error', function (err) {
      console.error('error');
      renderer.error(err);
    })
    .on('log', function (log) {
      console.error('log');
      renderer.log(log);
    })
    .on('prompt', function (prompt, callback) {
      console.error('prompt');
      renderer.prompt(prompt)
        .then(function (answer) {
          callback(answer);
        });
    });
  return deferred.promise;
};

PluginConfig.prototype.addBowerRequireJSConfig = function (dir) {
  var deferred = Q.defer();
  var metadata_file_abs = bower_components + '/' + dir + '/.bower.json';
  console.log('add bower dependency ' + metadata_file_abs);
  var that = this;
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
      value = bower_components_url + '/' + dir + '/' + script.substring(0, script.length - 3);
      that.requirejs_config.paths[dir] = value;
    } else if (script && script.match(/.*\.css$/i)) {
      value = that.requirejs_config.map['*'].css + '!' + bower_components_url + '/' + dir + '/' + script.substring(0, script.length - 4);
      that.requirejs_config.map['*'][dir] = value;
    }
    deferred.resolve(dir);
  });
  return deferred.promise;
};

PluginConfig.prototype.deriveBowerRequireJSConfig = function (that) {
  console.log('derive bower config');
  var deferred = Q.defer();
  fs.readdir(bower_components, function (err, files) {
    console.log(err);
    var i = 0, l = files.length;
    function next() {
      if (i < l) {
        var f = files[i++];
        if (that.ignoredBoweredDependencies.indexOf(f) >= 0) {
          next();
        } else {
          that.addBowerRequireJSConfig(f).then(next);
        }
      } else {
        deferred.resolve(that);
      }
    }
    next();
  });
  return deferred.promise;
};

PluginConfig.prototype.parseDir = function (plugindir) {
  var deferred = Q.defer();
  var that = this;
  fs.readdir(plugindir, function (err, files) {
    console.log(err);
    if (typeof files === 'undefined') {
      deferred.resolve(that);
      return;
    }
    //map pluginDir to promise function and execute them
    files.map(function (f) {
      return function () {
        var d = Q.defer();
        fs.stat(plugindir + '/' + f, function (err, stats) {
          if (stats.isDirectory()) {
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
  return deferred.promise;
};

PluginConfig.prototype.parseDirs = function (pluginDirs) {
  var that = this;
  return pluginDirs.map(function (pluginDir) {
    return function () {
      return that.parseDir(pluginDir);
    };
  }).reduce(Q.when, Q.resolve(that));
};

var defaultConfig = {
  mainFile: './demo-app/main',
  apiPrefix: '/api',
  apiSuffix: '',
  baseUrl: '',
  configPrefix : '../',
  pluginDirs: ['plugins', 'external']
};

module.exports.gen = function (config) {
  var c = {};
  extend(c, defaultConfig, config || {});
  var plugins = new PluginConfig(c);
  return plugins.parseDirs(c.pluginDirs)
    .then(PluginConfig.prototype.deriveBowerRequireJSConfig)
    .then(function () {
      return createConfigFile(plugins.requirejs_config);
    });
};

function findAppsInDir(plugindir, result) {
  var deferred = Q.defer();
  fs.readdir(plugindir, function (err, files) {
    console.log(plugindir, err);
    if (files === undefined) {
      deferred.resolve(result);
      return;
    }
    //map pluginDir to promise function and execute them
    files.map(function (f) {
      return function () {
        var d = Q.defer();
        fs.stat(plugindir + '/' + f + '/index.html', function (err, stats) {
          if (stats && stats.isFile()) {
            result.push(f);
          }
          d.resolve(null);
        });
        return d.promise;
      };
    }).reduce(Q.when, Q.resolve(null)).then(function () {
      //ok directory done
      deferred.resolve(result);
    });
  });
  return deferred.promise;
}

module.exports.findApps = function (config) {
  var c = {};
  extend(c, defaultConfig, config || {});
  return c.pluginDirs.map(function (pluginDir) {
    return function (result) {
      return findAppsInDir(pluginDir, result);
    };
  }).reduce(Q.when, Q.resolve([]));
};

module.exports.dumpDependencies = function (config) {
  var c = {};
  extend(c, defaultConfig, config || {});
  var cc = new PluginConfig(c);
  return cc.parseDirs(c.pluginDirs).then(PluginConfig.prototype.dumpBower);
};


if (require.main === module) {
  var program = require('commander').version('0.0.1')
    .option('-m, --main-file <mainFile>', 'specify main file [./main]', defaultConfig.mainFile)
    .option('--no-bower', 'skips running bower')
    .option('--api-prefix <prefix>', 'specify api prefix [/api]', defaultConfig.apiPrefix)
    .option('--api-suffix <suffix>', 'specify api suffix []', defaultConfig.apiSuffix)
    .option('-b, --base-url <baseUrl>', 'script base url [./scripts]', defaultConfig.baseUrl)
    .option('-d, --plugin-dirs <pluginDirs>', 'plugin dirs base url [static/scripts,external]', function (val) {
      return val.split(',').map(String.prototype.trim.call);
    }, defaultConfig.pluginDirs)
    .parse(process.argv);

  var c = new PluginConfig(program);
  var r = c.parseDirs(program.pluginDirs).then(PluginConfig.prototype.dumpBower);
  if (program.bower === undefined || program.bower) {
    r = r.then(PluginConfig.prototype.runBower);
  }
  r.then(PluginConfig.prototype.deriveBowerRequireJSConfig)
    .then(PluginConfig.prototype.dumpConfig)
    .done();
}
