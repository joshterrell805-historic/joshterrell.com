module.exports = render;

var debug = require('debug')('jt:lib:render');

var templates = [];
registerTemplates();

/**
 * @return the rendered template
 */
function render(name, data) {
  if (!templates[name]) {
    throw new CError('INVALID_TEMPLATE', 'NOENT: ' + name);
  }
  return templates[name](data);
}

function registerTemplates() {
  getFilenames(site.config.templateRoot)
  .done(function(filenames) {
    filenames.forEach(function(filename) {
      readFile(filename)
      .done(function(source) {
        var name = filename.substr(site.config.templateRoot.length);
        name = name.substr(0, name.length - '.ejs'.length);
        debug('loaded %s', name);
        assert(!templates[name]);
        templates[name] = _.template(source, {variable: 'data'});
      });
    });
  });
}

/**
 * @resolve an array of all template filenames in a directory and all its
 *    sub-directories.
 */
function getFilenames(dir) {
  return fs_readdir(dir)
  .then(function recursiveStep(filenames) {
    var loadedFilenames = [];
    var filenameArrayPs = [];

    filenames.forEach(function(filename) {
      if(filename[0] === '.') {
      } else if (filename.substr(filename.length - 4) === '.ejs') {
        loadedFilenames.push(dir + '/' + filename);
      } else {
        filenameArrayPs.push(getFilenames(dir + '/' + filename));
      }
    });

    return Promise.all(filenameArrayPs)
    .then(function(filenameArrays) {
      var filenames = loadedFilenames;
      for (var i = 0; i < filenameArrays.length; ++i) {
        filenames = filenames.concat(filenameArrays[i]);
      }
      return filenames;
    });
  });
}
