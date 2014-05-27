var path    = require('path'),
    baseUri = '/bamboo/rest/api',
    endpoints;

/// - Endpoints ----------------------------------------------------------------

endpoints = [
  {
    uri: 'latest/plan',
    json: require('../bamboo/latest-plan.json')
  }, {
    uri: 'latest/result',
    json: require('../bamboo/latest-result.json')
  }
];

/// - Export -------------------------------------------------------------------

module.exports = function (parentApp) {
  var app = require('express')();
  endpoints.forEach(function (endpoint) {
    var fullUri = path.join(baseUri, endpoint.uri);
    app.get(fullUri, function (req, res) {
      res.json(endpoint.json);
    });
  });
  parentApp.use(app);
};