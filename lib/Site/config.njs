module.exports = (function genConfig() {
  var c = {};

  if (process.env.PWD === '/var/www/joshterrell.com') {
    c.production = true;
    c.port = 7005;
    c.DEBUG = 'jugglypuff:*';
  } else if (process.env.PWD === '/home/josh/repos/joshterrell.com') {
    c.production = false;
    c.port = 8009;
    c.DEBUG = '*';
  } else {
    throw new Error('invalid site root: ' + process.env.PWD);
  }
  if (process.env.HOSTNAME === 'joshPC' ||
      process.env.HOSTNAME === 'joshLT') {
    c.local = true;
  }

  c.siteRoot = process.env.PWD;
  c.hostname = 'localhost';
  c.title = 'Josh Terrell';
  c.sessionDuration_s = 24 * 60 * 60;
  c.responderExtension = '.njs';

  c.templateRoot = c.siteRoot + '/templates';
  c.libRoot = c.siteRoot + '/lib';
  c.responderRoot = c.siteRoot + '/responders';
  c.publicRoot = c.siteRoot + '/public';

  c.credentials = require('./.credentials.njs');

  return c;
})();
