module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('jt:responders:doc:_');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET() {
    var title = Doc.pathnameToTitle(this.req.pathname);

    // TODO move this to own responder.
    if (title === 'new' && this.session) {
      var doc = yield Doc.create();
      return this.redirect('303', doc.title);
    } else {
      var doc = yield Doc.findByTitle(title);
    }

    if (!doc || (doc.private && !this.session)) {
      this.setStatusCode('404');
      this.pageTitle = 'Document Not Found';
      var context = {
        notFound: true,
      };
    } else {
      this.pageTitle = doc.title;
      var context = _.defaults({doc: doc}, yield doc.getRenderContext());

      if (this.session) {
        this.addScript('url', '/js/CodeMirror/lib/codemirror.js');
        this.addScript('url', '/js/CodeMirror/addon/mode/overlay.js');
        this.addScript('url', '/js/CodeMirror/addon/dialog/dialog.js');
        this.addScript('url', '/js/CodeMirror/addon/search/searchcursor.js');
        this.addScript('url', '/js/CodeMirror/mode/clike/clike.js');
        this.addScript('url', '/js/CodeMirror/addon/edit/matchbrackets.js');
        this.addScript('url', '/js/CodeMirror/keymap/vim.js');
        this.addScript('url', '/js/CodeMirror/mode/xml/xml.js');
        this.addScript('url', '/js/CodeMirror/mode/markdown/markdown.js');
        this.addScript('url', '/js/CodeMirror/mode/gfm/gfm.js');
        this.addScript('url', '/js/CodeMirror/mode/javascript/javascript.js');
        this.addScript('url', '/js/CodeMirror/mode/htmlmixed/htmlmixed.js');
        this.addScript('url', '/js/CodeMirror/mode/css/css.js');
        this.addScript('url', '/js/md5.js');
        this.addScript('url', '/js/doc/_.js');

        this.addStylesheet('/css/CodeMirror/lib/codemirror.css');
        this.addStylesheet('/css/CodeMirror/addon/dialog/dialog.css');
        this.addStylesheet('/css/CodeMirror/theme/twilight.css');
      }
    }

    this.stylesheets.push('/css/doc/_.css');
    return this.renderPage(__filename, context);
  },
};
