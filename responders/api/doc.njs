module.exports = Responder;

var Doc = lib('Content/Doc'),
    debug = require('debug')(':responder:api/doc');

function Responder() {
  ApiResponder.apply(this, arguments);
}

Responder.prototype = Object.create(ApiResponder.prototype);

Responder.prototype.methods = {
  /** TODO **/
  'GET': function* GET() {
    throw new Error('not implemented');
   var obj;
   if (!this.session) {
    this.responseCode = 401;
    obj = '';
   } else {
    this.responseCode = 304;
    this.query.hash;
    obj = ''
   }

   this.reply(obj);
  },

  /**
   * update a draft..creating is gui request.
   **/
  'POST': function* POST() {
    this.validateCsrf();
    this.validateSession();

    var doc = JSON.parse(yield this.req.getBody());
    doc.edit_ts = new Date(doc.edit_ts);
    doc.publish_ts = new Date(doc.publish_ts);
    yield Doc.update(doc);

    var context = yield Doc.prototype.getRenderContext.call(doc);
    var rendered = renderTemplate('/doc/doc', context);

    return JSON.stringify({
      success: true,
      rendered: rendered,
    });
  },

  'DELETE': function* DELETE(cont) {
    this.validateCsrf();
    this.validateSession();

    var id = this.req.query.id;
    yield Doc.delete(id);
    return JSON.stringify({
      success: true,
    });
  },
};
