var nconf     = require('nconf'),
    Q         = require('q'),
    _         = require('underscore'),

    logger    = require('../../util/logger'),
    bamboo    = require('../../service/bamboo/bamboo-service');

/// - Endpoints ----------------------------------------------------------------

module.exports = {

  rootUri: '/bamboo-build-status',
  endpoints: [
    {
      get: function (req, res) {
        resp.send({ available: true })
      }
    }, {
      uri: '/plan-digest',
      get: function (req, res) {
        bamboo
          .getLatestPlanDigest()
          .then(sendAsJson(res))
          .catch(sendAsJson(res))
          .done();
      }
    }, {
      uri: '/build-board',
      get: function (req, res) {
        bamboo
          .getLatestBuildBoardDigest({ favorite: true })
          .then(sendAsJson(res))
          .catch(sendAsJson(res))
          .done();
      }
    }
  ]

};

/// - Utility functions --------------------------------------------------------

function sendAsJson(res) {
  return function (data) {
    logger.info('Write JSON')
    res.json(data);
  }
}