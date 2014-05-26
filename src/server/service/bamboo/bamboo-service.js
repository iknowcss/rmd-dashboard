var nconf     = require('nconf'),
    Q         = require('q'),
    _         = require('underscore'),
    NodeCache = require('node-cache'),

    logger    = require('../../util/logger'),
    bamboo    = require('../../data-source/bamboo/bamboo-rest'),

    cache     = new CacheLoader('bamboo-service', { stdTTL: 10 }),
    ps        = new Processor(),

    service   = {};

/// - Export -------------------------------------------------------------------

module.exports = service;

/// - Service points -----------------------------------------------------------

_.extend(service, {

  getLatestPlanDigest: function (options) {
    return cache.loadCachedResource('latest-plans-digest', function () {
      return bamboo
        .getLatestPlans(options)
        .then(ps.digestLatestPlans);
      });
  },

  getLatestBuildBoardDigest: function (options) {
    var plans;

    return service.getLatestPlanDigest(options)
      .then(function (data) {
        plans = data;
        return bamboo
          .getLatestResults(options)
          .then(ps.digestLatestResults);
      })
      .then(function (results) {
        return ps.mapPlanInfoToResults(plans, results);
      });
  }

});

/// - Cache util ---------------------------------------------------------------

function CacheLoader(baseCacheKey, options) {
  this.cache = new NodeCache(_.extend({}, options));
  this.baseCacheKey = baseCacheKey;
}

_.extend(CacheLoader.prototype, {

  loadCachedResource: function (cacheKey, loadPromiseBuilder) {
    var self = this,
        fullCacheKey = this.baseCacheKey + ':' + cacheKey,
        loadCacheDeferred = Q.defer();

    self.cache.get(fullCacheKey, function (err, value) {
      if (!err) {
        if (value[fullCacheKey]) {
          logger.info('Load "' + fullCacheKey + '" from cache');
          loadCacheDeferred.resolve(value[fullCacheKey])
        } else {
          logger.info('"' + fullCacheKey + '" is stale');
          Q.when(loadPromiseBuilder())
            .then(function (data) {
              var saveCacheDeferred = Q.defer();
              self.cache.set(fullCacheKey, data, function (err) {
                if (!err) {
                  saveCacheDeferred.resolve(data);
                } else {
                  saveCacheDeferred.reject({
                    error: 'Could not save to cache',
                    cacheErr: err
                  });
                }
              });
              return saveCacheDeferred.promise;
            })
            .then(function (data) {
              loadCacheDeferred.resolve(data);
            })
            .done()
        }
      } else {
        logger.error('Error loading "' + fullCacheKey + '"');
        loadCacheDeferred.reject({
          error: 'Could not load from cache',
          cacheErr: err
        });
      }
    });

    return loadCacheDeferred.promise;
  }
});

/// - Processing constructor ---------------------------------------------------

function Processor() {
  // Pre-bind all functions to this object so they may be passed to Q
  // without explicitly binding to this each time
  _.functions(this).forEach(function (name) {
    if (name !== 'constructor') {
      this[name] = _.bind(this[name], this);
    }
  }, this);
}

/// - Processing functions -----------------------------------------------------

_.extend(Processor.prototype, {

  digestLatestPlans: function (data) {
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

  digestLatestResults: function (data) {
    var output = {};

    logger.info('Process latest results');
    output.results = _.map(data.results.result, function (build) {
      return {
        key             : build.key,
        number          : build.number,
        lifeCycleState  : build.lifeCycleState,
        state           : build.state
      };
    });

    return output;
  },

  mapPlanInfoToResults: function (plans, results) {
    var output = {};

    logger.info('Map plan info to results');
    output.results = _.map(results.results, function (build) {
      var match = build.key.match(/^(.+?)-\d+$/),
          planKey = match[1],
          plan = _.findWhere(plans.plans, { key: planKey });
      return {
        plan            : plan,
        key             : build.key,
        number          : build.number,
        lifeCycleState  : build.lifeCycleState,
        state           : build.state
      };
    });

    return output;
  }

});