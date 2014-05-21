var path      = require('path'),
    request   = require('request'),
    nconf     = require('nconf'),
    Q         = require('q'),
    _         = require('underscore'),

    logger    = require('../../util/logger'),
    timestamp = require('../../util/timestamp'),

    slice     = Array.prototype.slice;

/// - Default config -----------------------------------------------------------

nconf.defaults({
  'bamboo-rest': {
    'cache-timeout': 60
  }
});

/// - Export -------------------------------------------------------------------

module.exports = new BambooRest();

/// - Constructor --------------------------------------------------------------

function BambooRest() {
  this.protocol = nconf.get('bamboo-rest:protocol');
  this.host = nconf.get('bamboo-rest:host');
  this.baseUrl = nconf.get('bamboo-rest:baseUrl');
  this.auth = {
    user: nconf.get('bamboo-rest:user'),
    pass: nconf.get('bamboo-rest:pass')
  };
  this.defaultOptions = {
    json: true,
    auth: this.auth,
    rejectUnauthorized: nconf.get('request:reject-unauthorized')
  };
  this.cache = {};
  this.cacheTimeout = nconf.get('bamboo-rest:cache-timeout');
}

/// - Service points -----------------------------------------------------------

_.extend(BambooRest.prototype, {

  getCachedLatestPlans: function (options) {
    return Q.when((function () {

      var timeSinceUpdate;
      if (this.cache.latestPlans) {
        timeSinceUpdate = timestamp.now() - this.cache.latestPlans.lastUpdated;
        if (timeSinceUpdate < this.cacheTimeout) {
          logger.info('Return cached plan info');
          return this.cache.latestPlans;
        } else {
          logger.info('Cache is stale. It is ', timeSinceUpdate, 
              ' seconds since last refresh');
        }
      }

      logger.info('Cache is empty');
      return this.getLatestPlans(options);

    }).call(this));
  },

  getLatestPlans: function (options) {
    var requestOptions = {
      qs: {
        favourite: _.isBoolean(options.favorite) ? options.favorite : false
      }
    };

    logger.info('Request plan info');
    return this.makeRequest('/latest/plan', requestOptions)
        .then(this.processLatestPlans.bind(this));
  },

  getLatestResults: function (options) {
    var self = this,
    requestOptions = {
      qs: {
        favourite: _.isBoolean(options.favorite) ? options.favorite : false
      }
    };

    return this.getCachedLatestPlans(options)
        .then(this.continueRequest('/latest/result', requestOptions))
        .then(this.processLatestResults.bind(this));
  }

});

/// - Processing functions -----------------------------------------------------

_.extend(BambooRest.prototype, {

  processLatestPlans: function (data) {
    var output = {};

    logger.info('Process latest plans');

    output.lastUpdated = timestamp.now();
    output.plans = _.map(data.plans.plan, function (plan) {
      return {
        shortName : plan.shortName,
        key       : plan.key,
        name      : plan.name
      };
    });

    this.cache.latestPlans = output;

    return output;
  },

  processLatestResults: function (data) {
    logger.info('Process latest results');
    return _.map(data.results.result, function (build) {
      var match = build.key.match(/^(.+?)-\d+$/)
          planKey = match[1],
          plan = _.where(this.cache.latestPlans.plans, { key: planKey })[0];
      return {
        plan            : plan,
        key             : build.key,
        number          : build.number,
        lifeCycleState  : build.lifeCycleState,
        state           : build.state
      };
    }, this);
  }

});

/// - Utilities ----------------------------------------------------------------

_.extend(BambooRest.prototype, {
  
  buildUrl: function () {
    var parts = [this.host, this.baseUrl].concat(slice.call(arguments)),
        result = this.protocol + '://' + path.join.apply(path, parts);
    return result + (result.slice(-1) !== '/' ? '/' : '');
  },

  makeRequest: function (relativeUrl, options) {
    var deferred = Q.defer(),
        requestOptions;

    requestOptions = _.extend({}, this.defaultOptions, options, {
      url: this.buildUrl(relativeUrl) 
    });

    // Make the request
    request.get(requestOptions, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        deferred.resolve(body, res);
      } else {
        if (!error) {
          error = '[ UNKNOWN ]';
        }
        deferred.reject({
          error: error.toString(),
          statusCode: res ? res.statusCode : error.code
        });
      }
    });

    // Return the pipeline to be added to
    return deferred.promise;
  },

  continueRequest: function (relativeUrl, options) {
    return (function () {
      return this.makeRequest(relativeUrl, options);
    }).bind(this);
  }

});