module.exports = Responder;

function Responder() {
   GuiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(GuiResponder.prototype);

Responder.prototype.methods = {
   'GET': function* GET(cont) {
      this.addStylesheet('/base/css/404.css');
      this.title = 'Page NOT FOUND BRO';
      return this.renderPage(__filename, {});
   }
};
