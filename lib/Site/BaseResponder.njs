module.exports = BaseResponder;

var debug = require('debug')('jt:lib:Site:BaseResponder'),
    url = require('url'),
    Session = lib('Session'),
    cookie = require('cookie'),
    jugglypuff = require('jugglypuff'),
    querystring = require('querystring');

/**
 * A Responder gathers required data and responds to a request.
 */
function BaseResponder() {
  jugglypuff.Responder.apply(this, arguments);
  this.on('unhandledMethodError', this.onMethodError);
}

BaseResponder.prototype = Object.create(jugglypuff.Responder.prototype);

/**
 * @override
 */
BaseResponder.prototype.respond = function respond() {
  if (!this.req.cookies.csrf) {
    this.resetCsrf();
  }

  var sessionId = this.req.cookies.sessionId;
  (sessionId ? Session.restore(sessionId) : Promise.resolve(null))
  .done(function(session) {
    this.session = session;
    if (this.session && this.session.expired) {
      this.deleteSession();
    }

    debug("session: %o", this.session);

    jugglypuff.Responder.prototype.respond.apply(this, arguments);
  }.bind(this));
};

/**
 * Should be called in every post request.
 *
 * bodyCsrf is a csrf token obtained from the body. It will be used
 *    rather than checking the headers if passed.
 */
BaseResponder.prototype.validateCsrf = function validateCsrf(bodyCsrf) {
  var cookies = this.req.cookies;
  var postCsrf = bodyCsrf || this.req.headers.csrf;
  if (!cookies.csrf || (postCsrf !== cookies.csrf))
    throw new CError('INVALID_CSRF', 'Invalid CSRF');
};

BaseResponder.prototype.validateSession = function validateSession() {
  if (!this.session)
    throw new CError('NO_SESSION', 'No Session');
};

BaseResponder.prototype.parsePostForm = function parsePostForm(body) {
  return JSON.parse(decodeURIComponent(querystring.parse(body).data));
}

BaseResponder.prototype.redirect = function redirect(code, url) {
  // 301:perm 307:temp, 303:modify
  this.setStatusCode(code);
  this.setHeader('Location', url);
}

BaseResponder.prototype.deleteSession = function deleteSession() {
  debug('delete session');
  this.session = null;
  this.setHeader('Set-Cookie', 'sessionId=CookieDeleted; ' +
      'path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure');
};

/**
 * Set a new CSRF for the user.
 */
BaseResponder.prototype.resetCsrf = function resetCsrf() {
  this.setCookie('csrf', Session.csrf(), {
    expires: new Date(Date.now() + 1000*60*60*24*365*10),
    httpOnly: false
  }, true);
};

BaseResponder.prototype.onMethodError = function onMethodError(resp, err) {
  // TODO things I may want to handle here
  // no session, invalid csrf, post data overflow
  require('debug')('jt:methodError')(err);
  resp.setStatusCode('500', true);
  resp.sendResponse(site.config.production ? '500: Unexpected Server Error' :
      err.toString());
};
