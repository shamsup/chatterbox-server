
var Message = require('./message');
var Util = require('./util');
var Url = require('url');
var fs = require('fs');

var mimetypes = {
  js: 'text/javascript',
  html: 'text/html',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  ttf: 'application/font-sfnt',
  otf: 'application/font-sfnt',
  woff: 'application/font-woff',
  woff2: 'application/font-woff2',
  eot: 'application/vnd.ms-fontobject'
};
var messages = [];


var requestHandler = function(request, response) {
  var path = Url.parse(request.url);
  var statusCode = 200;
  var headers = Util.defaultCorsHeaders;
  headers['Content-Type'] = 'text/json';
  if (request.method === 'GET' && (path.pathname === '/' || path.pathname.match(/\.(js|css|html|json|woff2|woff|ttf|otf|svg|eot)$/))) {
    var f = path.pathname === '/' ? '/index.html' : (path.pathname || '/index.html');
    f = './client' + f;
    var extension = f.match(/\.(js|css|html|json|woff2|woff|ttf|otf|svg|eot)$/)[1];
    var mimetype = mimetypes[extension];

    fs.exists(f, function(exists) {
      if (exists) {
        fs.readFile(f, function (err, contents) {
          if (err) {
            response.writeHead(500, headers);
            response.end();
            // 500 die and end
            return;
          }
          headers['Content-Type'] = mimetype;
          response.writeHead(200, headers);
          response.end(contents);
        });
      } else {
        response.writeHead(404, headers);
        response.end();
      }
    });
  } else if (request.method === 'GET' && path.pathname === '/log') {

    response.writeHead(statusCode, headers);
    response.end('{}');

  } else if (path.pathname === '/classes/messages') {

    if (request.method === 'OPTIONS') {
      // Handle the OPTIONS request for CORS
      response.writeHead(statusCode, headers);
      response.end();
    } else if (request.method === 'GET') {
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
              '$gt': '2016-29'
            },
            username: {
              '$eq': 'Jono'
            }
          }
        }

        var a = (condition ? evaluate if true : evaluate if false)
      */


      //decodeURIC
      var queriesObj = {};
      queries = queries.map(item => item.split('='));
      queries.forEach(element => (
        queriesObj[element[0]] = (element[0] === 'where')
        ? JSON.parse(Util.urlDecode(element[1]))
        : Util.urlDecode(element[1])
      ));

      var results = messages;
      if (queriesObj.order) {
        results = results.sort(function(msgA, msgB) {
          return (queriesObj.order[0] === '-' ? -1 : 1) * (msgA.createdAt - msgB.createdAt);
        });
      }
      if (queriesObj.where) {
        results = results.filter(Util.whereFilter(queriesObj.where));
      }
      if (queriesObj.limit) {
        results = results.slice(0, queriesObj.limit);
      }

      var obj = {
        results: results
      };
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(obj));

    } else if (request.method === 'POST') {
      // Handle POST request for new messages
      Util.readBody(request, function(requestText) {
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
        Util.readBody(request, function(requestText) {
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
    } else if (request.method === 'DELETE') {
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
    response.end();
  }


};


module.exports.requestHandler = requestHandler;
