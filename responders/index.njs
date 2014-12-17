module.exports = Responder;

var Doc = lib('Content/Doc');

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET() {
    var doc = yield Doc.findByTitle('!index');
    this.pageTitle = 'Welcome';
    var context = _.defaults({doc: doc}, yield doc.getRenderContext());
    this.stylesheets.push('/css/index.css');
    return this.renderPage(__filename, context);
  },
};
