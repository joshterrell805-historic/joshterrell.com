module.exports = Responder;

var Doc = lib('Content/Doc');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET() {
    this.pageTitle = 'Documents';
    var context = {};
    var index = yield Doc.getIndex(this.session);
    context.index = index;
    if (this.session) {
      this.scripts.push({type: 'code', code: '$(function() {' +
          'PageActions.add({id:"create", href:"/doc/new", ' +
          'tooltip:"New"});PageActions.enable("create");});'});
    }
    this.stylesheets.push('/css/shared/indexes.css');
    return this.renderPage(__filename, context);
  }
};
