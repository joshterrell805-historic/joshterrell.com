module.exports = GuiResponder;

var BaseResponder = lib('Site/BaseResponder'),
    debug = require('debug')('jt:GuiResponder'),
    assert = require('assert'),
    Session = lib('Session');

function GuiResponder() {
  BaseResponder.apply(this, arguments);

  this.stylesheets = [];
  this.scripts = [];

  this.addStylesheet('//cdnjs.cloudflare.com/ajax/libs/foundation/5.3.3/css/normalize.min.css');
  this.addStylesheet('//cdnjs.cloudflare.com/ajax/libs/foundation/5.3.3/css/foundation.min.css');
  this.addStylesheet('//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.2/styles/solarized_dark.min.css');
  this.addStylesheet('/css/global.css');

  this.addScript('url', '//code.jquery.com/jquery-2.1.1.min.js');
  this.addScript('url', '/js/jquery-cookie.js');
  this.addScript('url', '//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.2/highlight.min.js');
  this.addScript('code', 'hljs.initHighlightingOnLoad();');
  this.addScript('url', '/js/TimestampToDate.js');
  this.addScript('url', '/js/PageActions.js');
  this.addScript('url', '//cdn.rawgit.com/joshterrell805/remaining-height/master/remaining-height.js');
}

GuiResponder.prototype = Object.create(BaseResponder.prototype);

GuiResponder.prototype.addScript = function addScript(type, data) {
  var script = {};
  script['type'] = type;
  script[ type ] = data;
  this.scripts.push(script);
};

GuiResponder.prototype.addStylesheet = function addStylesheet(url) {
  this.stylesheets.push(url);
};


GuiResponder.prototype.pageTitle = site.config.title;

/* the name of the template that is used as the base page for this page */
GuiResponder.prototype.basePageTemplate = '/shared/page';

/**
 * @resolve the rendered page
 */
GuiResponder.prototype.renderPage = function renderPage(pageName, context) {
  var ext = site.config.responderExtension;
  if (pageName.substr(pageName.length - ext.length) === ext) {
    pageName = this.respPathToPageName(pageName);
  }

  // This probably isn't the *best* way.. but it needs to happen some how.
  var csrfCookie = this.cookiesToSet_['csrf'];
  var csrf = (csrfCookie && csrfCookie['value']) || this.req.cookies.csrf;
  assert(!!csrf);

  var opts = {
    pageTitle: this.pageTitle,
    siteTitle: site.config.title,
    session: this.session,
    sessionStr: this.session+'',
    loginUrl: this.session ? false :
       Session.generateOauthUrl(this.req.pathname, csrf),
    stylesheets: this.stylesheets,
    scripts: this.scripts,
    page: pageName,
    context: context,
  };
  return renderTemplate(this.basePageTemplate, opts);
};

/**
 * Convert a responder's path (__filename) to its corresponding template page.
 */
GuiResponder.prototype.respPathToPageName =function respPathToPageName(path) {
   var pageName = path.substr(0, path.length -
       site.config.responderExtension.length);
   pageName = pageName.substr(site.config.responderRoot.length) + 'Page';
   debug('convert module to page: %s -> %s', path, pageName);
   return pageName;
};
