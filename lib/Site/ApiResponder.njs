module.exports = ApiResponder;

var BaseResponder = lib('Site/BaseResponder'),
    debug = require('debug')('jt:lib:Site:ApiResponder');

function ApiResponder() {
  BaseResponder.apply(this, arguments);
}

ApiResponder.prototype = Object.create(BaseResponder.prototype);
