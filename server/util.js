module.exports.defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key',
  'access-control-max-age': 10 // Seconds.
};

module.exports.readBody = function(request, callback) {
  var body = [];
  request.on('data', function(data) {
    body.push(data.toString());
  });
  request.on('end', function() {
    body = body.join('');
    callback(body);
  });
};

module.exports.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};

module.exports.whereFilter = function(whereClause) {

  return function (element, index) {
    if (!element) { return false; }
    var flag = true;
    for (var key in whereClause) {
      if (whereClause.hasOwnProperty(key)) {
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
  };
};
