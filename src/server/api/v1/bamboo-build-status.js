var nconf     = require('nconf'),
    Q         = require('q'),
    _         = require('underscore'),

    logger    = require('../../util/logger')
    bamboo    = require('../../data-source/bamboo/bamboo-rest'),

    ps        = {},
    handler   = { processor: ps };

/// - Export -------------------------------------------------------------------

module.exports = handler;

/// - Endpoints ----------------------------------------------------------------

_.extend(handler, {

  rootUri: '/bamboo-build-status',
  endpoints: [
    {
      get: function (req, res) {
        resp.send({ available: true })
      }
    }, {
      uri: '/plans',
      get: function (req, res) {
        bamboo
          .getLatestPlans({ favorite: true })
          .then(ps.processLatestPlans)
          .then(sendAsJson(res))
          .catch(sendAsJson(res))
          .done();
      }
    }, {
      uri: '/results',
      get: function (req, res) {
        bamboo
          .getLatestResults({ favorite: true })
          .then(sendAsJson(res))
          .catch(sendAsJson(res))
          .done();
      }
    }
  ]

});

/// - Processing functions -----------------------------------------------------

_.extend(ps, {

  processLatestPlans: function (data) {
    var output = {};

    logger.info('Process latest plans');
    output.plans = _.map(data.plans.plan, function (plan) {
      return {
        shortName : plan.shortName,
        key       : plan.key,
        name      : plan.name
      };
    });

    return output;
  },

  processLatestResults: function (data) {
    return data;

    // logger.info('Process latest results');
    // return _.map(data.results.result, function (build) {
    //   var match = build.key.match(/^(.+?)-\d+$/)
    //       planKey = match[1],
    //       plan = _.where(this.cache.latestPlans.plans, { key: planKey })[0];
    //   return {
    //     plan            : plan,
    //     key             : build.key,
    //     number          : build.number,
    //     lifeCycleState  : build.lifeCycleState,
    //     state           : build.state
    //   };
    // }, this);
  }

});

/// - Utility functions --------------------------------------------------------

function sendAsJson(res) {
  return function (data) {
    logger.info('Write JSON')
    res.json(data);
  }
}