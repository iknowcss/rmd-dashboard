var path    = require('path'),
    request = require('request'),
    nconf   = require('nconf'),
    Q       = require('q'),
    _       = require('underscore'),

    slice   = Array.prototype.slice;

/// - Export--------------------------------------------------------------------

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
    auth: this.auth
  }
}

/// - Service points -----------------------------------------------------------

_.extend(BambooRest.prototype, {

  getLatestResults: function (options) {
    var requestOptions = {
      qs: {
        favourite: _.isBoolean(options.favorite) ? options.favorite : false
      }
    };

    return this.buildRequestPipeline('/latest/result', requestOptions)
        .then(this.processLatestResults);
  }

});

/// - Processing functions -----------------------------------------------------

_.extend(BambooRest.prototype, {

  processLatestResults: function (data) {
    // TODO: Make this do something more interesting
    return {
      builds: data.results.result
    };
  }

});

/// - Utilities ----------------------------------------------------------------

_.extend(BambooRest.prototype, {
  
  buildUrl: function () {
    var parts = [this.host, this.baseUrl].concat(slice.call(arguments)),
        result = this.protocol + '://' + path.join.apply(path, parts);
    return result + (result.slice(-1) !== '/' ? '/' : '');
  },

  buildRequestPipeline: function (relativeUrl, options) {
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
        deferred.reject({
          error: error,
          statusCode: res ? res.statusCode : error.code
        });
      }
    });

    // Return the pipeline to be added to
    return deferred.promise;
  },

});