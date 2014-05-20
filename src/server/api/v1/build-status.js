var q       = require('q'),
    logger  = require('../../util/logger'),
    bamboo  = require('../../data-source/bamboo/bamboo-rest');

module.exports = {

  rootUri: '/build-status',
  endpoints: [
    {
      get: function (req, res) {
        resp.send({ success: true })
      }
    }, {
      uri: '/query-bamboo',
      get: function (req, res) {
        bamboo
          .getLatestFavoritePlans()
          .then(function (plans) {
            res.json(plans);
          })
          .catch(function (error) {
            res.json(error);
          })
          .done();
      }
    }
  ]

};