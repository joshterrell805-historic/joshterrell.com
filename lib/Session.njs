module.exports = Session;

var User = lib('User'),
    google = require('googleapis'),
    Promise = require('promise'),
    md5 = require('blueimp-md5').md5,
    credentials = site.config.credentials.googleOauth2,
    debug = require('debug')('BaseSite:Session'),
    assert = require('assert');;

var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');
var scopes = ['https://www.googleapis.com/auth/userinfo.email'];
var oauth2Client = new OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri);

function Session() {
  // the sessionId
  this.id = null;
  // the corresponding User object
  this.user = null;
  // true if this session was created in this request
  this.created = null;
  // if this request is a result of the user attempting to login,
  // redirectUrl is the url that the visitor came from.
  this.redirectUrl = null;
  // true if this session is expired
  this.expired = null;
}

Session.prototype.toString = function toString() {
  return JSON.stringify(this);
};

Session.csrf = function csrf() {
  return md5(Math.random());
};

Session.generateOauthUrl = function generateOauthUrl(url, csrf) {
  if (!site.config.production) {
    return '#development';
  }

  var url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes,
    state: JSON.stringify({
      csrf: csrf,
      redirectUrl: url,
    })
  });

  return url;
};

Session.generateId = function generateId() {
  return md5(Math.random());
};

/**
 * Attempt to login using the authcode
 */
Session.login = function login(code, state, cookieCsrf) {
  return new Promise(function(resolve, reject) {
    try {
      state = state && JSON.parse(state);
    } catch (e) {
      reject(new CodedError('INVALID_JSON', 'Invalid state Json'));
    }

    if (!code || !state) {
      reject(new CodedError('MISSING_FIELD',
          'missing code or state query parameters'));
    }

    // This is the only place where the csrf comes from a query parameter.
    if (!(state && state.csrf && state.csrf === cookieCsrf)) {
      reject(new CodedError('INVALID_CSRF', 'Invalid Csrf Token'));
    }

    oauth2Client.getToken(code, function(err, tokens) {
      if (err)
        reject(err);
      else {
        oauth2Client.setCredentials({access_token: tokens.access_token});
        plus.people.get({ userId: 'me', auth: oauth2Client },
            function(err, response) {
          if (err)
            reject(err);
          else {
            var emails = response.emails.map(function(val) {
              return val.value;
            });
            resolve(Session.create_(emails, state.redirectUrl));
          }
        });
      }
    });

  });
};

/**
 * Create a new session
 */
Session.create_ = function create_(emails, redirectUrl) {
  var sessionId = Session.generateId();
  return User.findByEmails(emails)
  .then(function(user) {
    if (!user) {
      var session = new Session();
      session.id = false;
      session.redirectUrl = redirectUrl;
      return session;
    }
    return Q('INSERT INTO sessions (user_id, id) VALUES (?, ?)',
        [user.id, sessionId])
    .then(function() {
      var session = new Session();
      session.id = sessionId;
      session.created = true;
      session.redirectUrl = redirectUrl;
      session.expired = false;
      session.user = user;
      return session;
    });
  });
};

/**
 * Restore a session from the database.
 *
 * If expired, return session with this.expired.
 * (note, this could be a false session all together, either way delete
 * the cookie).
 */
Session.restore = function restore(sessionId) {
  if (!site.config.production) {
    var session = new Session();
    session.id = sessionId;
    session.user = new User();
    session.user.id = 1;
    session.user.email = 'dev@joshterrell.com';
    session.created = false;
    session.expired = false;
    return Promise.resolve(session);
  }

  return Q('SELECT user_id FROM sessions WHERE id = ? ' +
      'AND UNIX_TIMESTAMP() < UNIX_TIMESTAMP(last_active_ts) + ?',
      [sessionId, site.config.sessionDuration])
  .then(function(results) {
    if (results.length == 1) {
      var updateSessionTs_p = Q('UPDATE sessions SET ' +
          'last_active_ts = CURRENT_TIMESTAMP WHERE id = ?',
          [sessionId]);
      var user_p = User.find(results[0].user_id);
      return Promise.all([updateSessionTs_p, user_p])
      .then(function(resolved) {
        var user = resolved[1];
        assert(!!user);
        var session = new Session();
        session.id = sessionId;
        session.user = user;
        session.created = false;
        session.expired = false;
        return session;
      });
    } else {
      // TODO expired sessions should get removed from the database peroidically
      // write a cron task
      var session = new Session();
      session.id = sessionId;
      session.created = false;
      session.expired = true;
      return session;
    }
  });
}
