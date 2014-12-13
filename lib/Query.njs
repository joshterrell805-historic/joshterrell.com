module.exports = Query;

var debug = require('debug')('jt:lib:Query'),
    mysql = require('mysql'),
    credentials = site.config.credentials.mysql,
    mysqlConnection = null,
    doQuery = null;

createConnection();
site.on('stop', kill);

function Query(query) {
  return doQuery(query);
}

function createConnection() {
  mysqlConnection = mysql.createConnection(credentials);

  mysqlConnection.on('error', function onConnectionError(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      createConnection();
    } else {
      throw err;
    }
  });

  mysqlConnection.connect(function onConnect(err) {
    if (err) {
      throw err;
    }
  });

  doQuery = Promise.denodeify(mysqlConnection.query.bind(mysqlConnection));
}

function kill() {
  if (mysqlConnection) {
    debug('killing mysql');
    mysqlConnection.end(function onEnd(err) {
      if (err) {
        throw err;
      }
    });
  }
};
