
var Message = require('./message');
var Url = require('url');

var messages = [
  new Message({
    username: 'Admin',
    message: 'Testing.',
    roomname: 'lobby'
  })
];

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  var path = Url.parse(request.url);
  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/json';

  if(request.method === 'GET' && path.pathname === '/log') {

     response.writeHead(statusCode, headers);
     response.end('{}');

  } else if (path.pathname === '/classes/messages') {

    if (request.method === 'OPTIONS') {
      // Handle the OPTIONS request for CORS
      response.writeHead(statusCode, headers);
      response.end();
    } else if(request.method === 'GET') {
      // Handle GET request for messages
      var queries = path.query.split('&');
      console.log(queries);
      var obj = {
        results: messages
      }
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(obj));
    } else if(request.method === 'POST') {
      // Handle POST request for new messages
      readBody(request, function(responseText) {
        var msg = new Message(JSON.parse(responseText));
        messages.push(msg);
        statusCode = 201;
        response.writeHead(statusCode, headers);
        response.end();
      });
    }
  } else if (path.pathname.match(/^\/classes\/messages\/\d+$/)) {
    var id = path.pathname.match(/^\/classes\/messages\/(\d+)$/)[1]; // => 123
    if (!messages[id]) {
      statusCode = 401;
    } else {
      statusCode = 200;
    }
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({results: messages[id]}));
  }
  else {
    statusCode = 404;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end('Hello, World!');
   }


};

var readBody = function(request, callback) {
  var body = [];
  request.on('data', function(data) {
    body.push(data.toString());
  });
  request.on('end', function() {
    body = body.join('');
    callback(body);
  });
}

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
