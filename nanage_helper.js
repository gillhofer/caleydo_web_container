/**
 * helper script for parsing package.json files
 *
 */
var cmd = process.argv[2];

function loadMeta() {
  var repo = process.argv[3];
  var meta = require('./plugins/'+repo+'/package.json');
  return meta;
}

function guessRepo(name, baseRepo) {
  if (!baseRepo || baseRepo.match(/Caleydo\/.*/) || name.match(/caleydo.*/)) {
    return 'Caleydo/'+name;
  }
  return baseRepo.split('/')[0]+'/'+name
}

var cmds = {
  catDependencies: function() {
    var meta = loadMeta();
    if (meta.peerDependencies) {
      Object.keys(meta.peerDependencies).forEach(function(dep) {
          console.log(dep+';'+guessRepo(dep, meta.repository));
      });
    }
  },
  catRepo: function() {
    var meta = loadMeta();
    if (meta.repository) {
      console.log(meta.repository)
    }
  }
}

cmds[cmd]()
