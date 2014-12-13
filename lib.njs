var libRoot = null;
module.exports = function(root) {
  libRoot = root;
  return lib;
};

var debug = require('debug')('jt:lib');

var loadedModules = {};

function lib(name) {
  var module = loadedModules[name];

  if (module === undefined) {
    module = require(libRoot + '/' + name + '.njs');
    debug('loaded %s', name);
    loadedModules[name] = module;
  }

  return module;
}
