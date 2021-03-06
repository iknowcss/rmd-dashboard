var nconf      = require('nconf'),
    _          = require('underscore'),

    logger     = require('../../util/logger'),
    datasource = require('../data-source-mixin'),
    timestamp  = require('../../util/timestamp');

/// - Export -------------------------------------------------------------------

module.exports = new BambooRest();

/// - Constructor --------------------------------------------------------------

function BambooRest() {
}

/// - Data source config -------------------------------------------------------

datasource(BambooRest.prototype, {

  protocol : nconf.get('bamboo-rest:protocol'),
  host     : nconf.get('bamboo-rest:host'),
  port     : nconf.get('bamboo-rest:port'),
  baseUrl  : nconf.get('bamboo-rest:baseUrl'),

  auth: {
    user: nconf.get('bamboo-rest:user'),
    pass: nconf.get('bamboo-rest:pass')
  },

  requestOptions: {
    json: true
  }

});

/// - Request functions --------------------------------------------------------

_.extend(BambooRest.prototype, {

  getLatestPlans: function (options) {
    var requestOptions = { 
      qs: { favourite: isFavourite(options) }
    };

    return this.makeRequest('/latest/plan', requestOptions);
  },

  getLatestResults: function (options) {
    var requestOptions = { 
      qs: { favourite: isFavourite(options) }
    };

    return this.makeRequest('/latest/result', requestOptions);
  }

});

/// - Utilities ----------------------------------------------------------------

function isFavourite(options) {
  if (options) {
    if (_.isBoolean(options.favorite)) {
      return options.favorite;
    } else if (_.isBoolean(options.favourite)) {
      return options.favourite;
    }
  }
  return false;
}