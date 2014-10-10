/**
 * Created by Samuel Gratzl on 10.10.2014.
 */

var fs = require('fs');
var Q = require('q');
var plugindir = 'static/scripts';
var config_file = 'static/scripts/config-gen.js';
var bower_file = 'bower.json';
var bower_components_url = '/bower_components';
var bower_components = 'static/bower_components';
var metadata_file = '/package.json';

var caleydo_plugins = [];
var requirejs_config = {
  baseUrl: '/scripts',
  paths: {},
  map: {
    '*': {
      'css': '${baseUrl}/require-css/css.js' // or whatever the path to require-css is
    }
  },
  deps: ['./main'],
  config: {
    'caleydo/main': {
      apiUrl: '/api'
    },
    //plugin config
    'caleydo/plugin': {
      baseUrl: '/scripts',
      plugins: caleydo_plugins
    }
  }
};

var bower_dependencies = {
  requirejs: '~2.1.8',
  'require-css': '~0.1.5'
};
var ignoredBoweredDependencies = ['requirejs', 'require-css'];

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


function dumpConfig() {
  var deferred = Q.defer();
  var config = JSON.stringify(requirejs_config, null, 4);
  config = resolveConfig(config);
  var config_full = '/*global require */\r\nrequire.config(' +
    config +
    ');';
  fs.writeFile(config_file, config_full, function (err) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      console.log(config_file + ' saved');
      deferred.resolve(config_full);
    }
  });
  return deferred.promise;
}

function addCaleydoPlugins(plugins) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }
  //TODO extend with default metadata stuff
  caleydo_plugins.push.apply(caleydo_plugins, plugins);
}

function addDependencies(dependencies, dir) {
  extend(bower_dependencies, dependencies);
}

function addRequireJSConfig(rconfig, dir) {
  extend(requirejs_config, rconfig);
}

function configRequireJSBower(rconfig, dir) {
  if (rconfig.ignore) {
    ignoredBoweredDependencies.push.apply(ignoredBoweredDependencies, rconfig.ignore);
  }
}

function addPlugin(dir) {
  var deferred = Q.defer();
  var metadata_file_abs = plugindir + '/' + dir + metadata_file;
  console.log('add plugin ' + metadata_file_abs);
  fs.readFile(metadata_file_abs, function (err, data) {
    if (err) {
      console.error('cant parse ' + metadata_file_abs, err);
      deferred.reject(new Error(err));
      return;
    }
    var metadata = JSON.parse(data);
    if (metadata.dependencies) {
      addDependencies(metadata.dependencies, dir);
    }
    if (metadata.hasOwnProperty('caleydo')) {
      var c = metadata.caleydo;
      if (c.plugins) {
        addCaleydoPlugins(c.plugins);
      }
      if (c['requirejs-config']) {
        addRequireJSConfig(c['requirejs-config'], dir);
      }
      if (c['requirejs-bower']) {
        configRequireJSBower(c['requirejs-bower'], dir);
      }
    }
    deferred.resolve(dir);
  });
  return deferred.promise;
}

function dumpBower() {
  console.log('dump bower');
  var deferred = Q.defer();
  fs.readFile(bower_file, function (err, data) {
    if (err) {
      deferred.reject(new Error(err));
    }
    var bower = JSON.parse(data);
    bower.dependencies = bower_dependencies;
    fs.writeFile(bower_file, JSON.stringify(bower, null, 4), function (err) {
      if (err) {
        throw err;
      }
      console.log(bower_file + ' saved');
      deferred.resolve(bower_file);
    });
  });
  return deferred.promise;
}

function runBower() {
  console.log('run bower');
  var deferred = Q.defer();
  var bower = require('bower');
  var cli = require('bower/lib/util/cli');

  //copied from bower/bin/bower
  var logger = bower.commands.install.line(['node', 'bower.js']);
  var renderer = cli.getRenderer('install', logger.json, bower.config);

  logger
    .on('end', function (data) {
      renderer.end(data);
      console.log('ran bower');
      deferred.resolve(data);
    })
    .on('error', function (err) {
      renderer.error(err);
    })
    .on('log', function (log) {
      renderer.log(log);
    })
    .on('prompt', function (prompt, callback) {
      renderer.prompt(prompt)
        .then(function (answer) {
          callback(answer);
        });
    });
  return deferred.promise;
}

function addBowerRequireJSConfig(dir) {
  var deferred = Q.defer();
  var metadata_file_abs = bower_components + '/' + dir + '/.bower.json';
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
      value = bower_components_url + '/' + dir + '/' + script.substring(0, script.length - 3);
      requirejs_config.paths[dir] = value;
    } else if (script && script.match(/.*\.css$/i)) {
      value = requirejs_config.map['*'].css + '!' + bower_components_url + '/' + dir + '/' + script.substring(0, script.length - 4);
      requirejs_config.map['*'][dir] = value;
    }
    deferred.resolve(dir);
  });
  return deferred.promise;
}

function deriveBowerRequireJSConfig() {
  console.log('derive bower config');
  var deferred = Q.defer();
  fs.readdir(bower_components, function (err, files) {
    var i = 0, l = files.length;
    function next() {
      if (i < l) {
        var f = files[i++];
        if (ignoredBoweredDependencies.indexOf(f) >= 0) {
          next();
        } else {
          addBowerRequireJSConfig(f).then(next);
        }
      } else {
        deferred.resolve(files);
      }
    }
    next();
  });
  return deferred.promise;
}

function createConfig() {
  console.log('dump config');
  dumpBower()
    .then(runBower)
    .then(deriveBowerRequireJSConfig)
    .then(dumpConfig);
}

fs.readdir(plugindir, function (err, files) {
  var i = 0, l = files.length;

  function next() {
    if (i < l) {
      var f = files[i++];
      fs.stat(plugindir + '/' + f, function (err, stats) {
        if (stats.isDirectory()) {
          addPlugin(f).then(next);
        } else {
          next();
        }
      });
    } else {
      createConfig();
    }
  }
  next();
});



