module.exports = Responder;

var Session = lib('Session'),
    debug = require('debug')('jt:responders:login'),
    cookie = require('cookie');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET() {
    if (this.session) {
      // POSSIBILITY 1: USER IS ALREADY LOGGED IN
      context.message = '<p>You are already logged in.</p>';
    } else {
      var code = this.req.query.code;
      var state = this.req.query.state;
      var context = {};
      // checks CSRF
      var session = yield Session.login(code, state, this.req.cookies.csrf);

      // POSSIBILITY 2: USER ATTEMPTED TO LOGIN BUT NO ACCOUNT
      if (!session.id) {
        context.message = '<p>Your gmail account has not been authorized to '
            + 'login to this website. '
            + '<a href="mailto:josh@joshterrell.com">Contact me</a> if you '
            + 'you should be authorized to login.</p>';
      } else if (session.created) {
       // POSSIBILITY 3: USER LOGGED IN SUCCESSFULLY
       debug('login success: %o', session);

       context.message = '<p>You have successfully logged in.</p>';
       this.resetCsrf();
       this.session = session;
       this.setCookie('sessionId', session.id, {
         expires: new Date(Date.now() + 1000*60*60*24*365*10),
       });
      }

      // the CSRF was valid which means that this request does not
      // originate from a third party. If the user changed the
      // redirectUrl value that's their own doing.
      context.message += '<p>Return to <a href="' + session.redirectUrl
          + '">where you came from</a>.</p>';
    }

    this.stylesheets.push('/css/login.css');

    return this.renderPage(__filename, context);
  }
};
