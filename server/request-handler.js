
var Message = require('./message');
var Url = require('url');

var messages = [];

var requestHandler = function(request, response) {
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
      var queries = (path.query && path.query.split('&')) || [];
      // equivalent of the line above
      // if (path.query !== null) {
      //   queries = path.query.split('&')
      // } else {
      //   queries = []
      // }

      /*



      ['order=createdAt','where={createdAt}']
      [['order', 'createdAt'], ['where', '{createdAt: {...}}']]
        {
          order: '-createdAt',
          where: {
            createdAt: {
              '$gt': '2016-29291438294y3829'
            }
          }
        }

        var a = (condition ? evaluate if true : evaluate if false)
      */


      //decodeURIC
      var queriesObj = {};
      queries = queries.map(item => item.split('='));
      console.log(queries);
      queries.forEach(element => (
        queriesObj[element[0]] = (element[0] === 'where')
        ? JSON.parse(urlDecode(element[1]))
        : urlDecode(element[1])
      ));

      console.log(queriesObj);

      var obj = {
        results: messages
      }
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(obj));

    } else if(request.method === 'POST') {
      // Handle POST request for new messages
      readBody(request, function(requestText) {
        var msg = new Message(JSON.parse(requestText));
        messages.push(msg);
        statusCode = 201;
        response.writeHead(statusCode, headers);
        response.end();
      });
    }
  } else if (path.pathname.match(/^\/classes\/messages\/\d+$/)) {
    var id = path.pathname.match(/^\/classes\/messages\/(\d+)$/)[1]; // => 123

    if (request.method === 'PUT') {
      if (!messages[id]) {
        statusCode = 404;
        response.writeHead(statusCode, headers);
        response.end();
      } else {
        statusCode = 200;
        readBody(request, function(requestText){
          var updates = JSON.parse(requestText);
          messages[id].update(updates);
          response.writeHead(statusCode, headers);
          response.end(JSON.stringify(messages[id]));
        });
      }
    } else if (request.method === 'GET') {
      if (!messages[id]) {
        statusCode = 404;
        response.writeHead(statusCode, headers);
        response.end();
      } else {
        statusCode = 200;
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(messages[id]));
      }
    } else if(request.method === 'DELETE') {
      if (!messages[id]) {
        statusCode = 404;
        response.writeHead(statusCode, headers);
        response.end();
      } else {
        statusCode = 200;
        response.writeHead(statusCode, headers);
        messages[id] = undefined;
        response.end();
      }
    }
  } else {
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

var urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
