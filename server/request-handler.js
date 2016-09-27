
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
        ? JSON.parse(urlDecode(element[1]))
        : urlDecode(element[1])
      ));

      var results = messages;
      if (queriesObj.order) {
        results = results.sort(function(msgA, msgB) {
          return (queriesObj.order[0] === '-' ? -1 : 1) * (msgA.createdAt - msgB.createdAt)
        });
      }
      if (queriesObj.where) {
        results = results.filter(whereFilter(queriesObj.where));
      }
      if (queriesObj.limit) {
        results = results.slice(0, queriesObj.limit);
      }

      var obj = {
        results: results
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

function whereFilter (whereClause) { // {createdAt: {...}, username: {...}, ...}
  // $eq means equals
  // $gt means greater than
  // $gte means greater or equal
  // $lt means less than
  // $lte means less or equal

  return function (element, index) {
    if (!element) return false;
    var flag = true;
    for (var key in whereClause) {
      if(whereClause.hasOwnProperty(key)) {
        var isDate = false;
        if (element[key] instanceof Date) {
          isDate = true;
        }

        if (whereClause[key].$eq) {
          flag = !flag ? false : whereClause[key].$eq.toString() === element[key].toString();
        }
        if (whereClause[key].$gt) {
          if (isDate) {
            whereClause[key].$gt = new Date(whereClause[key].$gt);
          }
          flag = !flag ? false : element[key] > whereClause[key].$gt;
        }

        if (whereClause[key].$gte) {
          if (isDate) {
            whereClause[key].$gt = new Date(whereClause[key].$gt);
          }
          flag = !flag ? false : element[key] >= whereClause[key].$gte;
        }

        if (whereClause[key].$lt) {
          if (isDate) {
            whereClause[key].$gt = new Date(whereClause[key].$gt);
          }
          flag = !flag ? false : element[key] < whereClause[key].$lt;
        }

        if (whereClause[key].$lte) {
          if (isDate) {
            whereClause[key].$gt = new Date(whereClause[key].$gt);
          }
          flag = !flag ? false : element[key] <= whereClause[key].$lte;
        }
      }
    }
    return flag;
  }
}

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
