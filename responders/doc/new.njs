module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')('jt:responders:doc:new');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);
// TODO do this to all Object.create
Responder.prototype.constructor = Responder;

Responder.prototype.methods = {
  'GET': function* GET() {
    this.validateSession();

    // TODO this is kind of terrible. think of a less hacky solution
    this.addScript('code', '$(function() {' +
        '$("#data").val(JSON.stringify({csrf: $.cookie("csrf")}));' +
        '$("#form").submit();})');

    return this.renderPage(__filename, {});
  },

  'POST': function* POST() {
    var body = yield this.req.getBody();
    var csrf = this.parsePostForm(body).csrf;
    this.validateCsrf(csrf);
    this.validateSession();

    var title = Doc.pathnameToTitle(this.req.pathname);
    var doc = yield Doc.create();
    return this.redirect('303', doc.title);
  },
};
