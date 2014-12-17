module.exports = Site;

// required first so process.env.DEBUG can be set before anyone requires debug.
var theConfig = require('./config.njs');
process.env.DEBUG = theConfig.DEBUG;

var jugglypuff = require('jugglypuff'),
    EventEmitter = require('events').EventEmitter,
    debug = require('debug')('jt:lib:Site:Site');

/**
 * Handle http requests for dynamic pages.
 * @param rootDir the root directory of the repo
 *
 * @emits stop on server stop
 */
function Site() {
  this.config = theConfig;
  this.setup();
}

Site.prototype = Object.create(EventEmitter.prototype);

Site.prototype.stop = function stop() {
  this.server.stop();
};

Site.prototype.setup = function setup() {
  // external
  global._ = require('underscore');
  global.Promise = require('promise');
  global.CError = require('ExtendableError').CodedError;
  global.fs = require('fs');
  global.assert = require('assert');
  global.readFile = function define_readFile() {
    var read = Promise.denodeify(fs.readFile);
    return function readFile(pathname) {
      return read(pathname, 'utf8');
    };
  }();
  global.fs_stat = Promise.denodeify(fs.stat);
  global.fs_readdir = Promise.denodeify(fs.readdir);


  // internal
  global.site = this;
  global.lib = require(this.config.siteRoot + '/lib.njs')(this.config.libRoot);
  global.Q = lib('Query');
  global.BaseResponder = lib('Site/BaseResponder');
  global.GuiResponder = lib('Site/GuiResponder');
  global.ApiResponder = lib('Site/ApiResponder');
  global.renderTemplate = lib('renderTemplate');
  global.renderMarkdown = lib('renderMarkdown');

};

/**
 * @resolve when started
 */
Site.prototype.start = function start() {
  var options = _.pick(this.config, 'hostname', 'port', 'responderRoot',
      'responderExtension');
  this.server = new jugglypuff.Server(options);
  this.server.on('stop', function emitStop() {this.emit('stop');}.bind(this));
  return this.server.start();
};
