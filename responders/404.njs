module.exports = Responder;

function Responder() {
  GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
  'GET': function* GET() {
    this.addStylesheet('/css/404.css');
    this.pageTitle = 'Page Not Found';
    return this.renderPage(__filename, {});
  }
};
