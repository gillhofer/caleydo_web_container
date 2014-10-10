/**
 * Created by Samuel Gratzl on 10.10.2014.
 */

var fs = require('fs');
var plugindir = 'static/scripts';
var config_file = 'static/scripts/config-gen.js';
var bower_file = 'bower.json';
var bower_components_url = '/bower_components';
var metadata_file = '/package.json';

var caleydo_plugins = [];
var requirejs_config = {
  baseUrl: '/scripts',
  paths: {},
  map: {
    '*': {
      'css': '/${baseUrl}/require-css/css.js' // or whatever the path to require-css is
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
  requirejs: "~2.1.8"
};

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


function dumpBower() {
  fs.readFile(bower_file, function (err, data) {
    if (err) {
      throw err;
    }
    var bower = JSON.parse(data);
    bower.dependencies = bower_dependencies;
    fs.writeFile(bower_file, JSON.stringify(bower, null, 4), function (err) {
      if (err) {
        throw err;
      }
      console.log(bower_file + ' saved');
    });
  });
}

function replaceVariables(config) {
  var vars = {
    baseUrl: bower_components_url
  };
  return config.replace(/$\{(.*)\}/gi, function (match, variable) {
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
  var config = JSON.stringify(requirejs_config, null, 4);
  config = resolveConfig(config);
  var config_full = '/*global require */\r\nrequire.config(' +
    config +
    ');';
  fs.writeFile(config_file, config_full, function (err) {
    if (err) {
      throw err;
    }
    console.log(config_file + ' saved');
  });
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

function addPlugin(dir, next) {
  var metadata_file_abs = plugindir + '/' + dir + metadata_file;
  fs.readFile(metadata_file_abs, function (err, data) {
    if (err) {
      console.error('cant parse ' + metadata_file_abs, err);
      return next();
    }
    var metadata = JSON.parse(data);
    if (metadata.caleydo && metadata.caleydo.plugins) {
      addCaleydoPlugins(metadata.caleydo.plugins);
    }
    if (metadata.dependencies) {
      addDependencies(metadata.dependencies, dir);
    }
    if (metadata.caleydo && metadata.caleydo['requirejs-config']) {
      addRequireJSConfig(metadata.caleydo['requirejs-config'], dir);
    }
  });

}

function createConfig() {
  //TODO dump or run bower
  dumpBower();
  //
  dumpConfig();
}

fs.readDir(plugindir, function (err, files) {
  var i = -1, l = files.length;

  function next() {
    if (i < l) {
      var f = files[i++];
      fs.stat(f, function (err, stats) {
        if (stats.isDirectory()) {
          addPlugin(f, next);
        }
      });
    } else {
      createConfig();
    }
  }

  next();
});



