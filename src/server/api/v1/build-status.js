var q       = require('q'),
    logger  = require('../../util/logger'),
    bamboo  = require('../../data-source/bamboo/bamboo-rest');

/// - Endpoint Definitions -----------------------------------------------------

module.exports = {

  rootUri: '/build-status',
  endpoints: [
    {
      get: function (req, res) {
        resp.send({ available: true })
      }
    }, {
      uri: '/list',
      get: function (req, res) {
        bamboo
          .getLatestResults({ favorite: true })
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
    res.json(data);
  }
}