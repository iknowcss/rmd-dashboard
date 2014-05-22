var _       = require('underscore')
    path    = require('path'),
    Q       = require('q'),
    request = require('request'),

    logger  = require('../util/logger'),

    slice      = Array.prototype.slice;

/// - Mixin applier ------------------------------------------------------------

module.exports = function (mixinPrototype, rawOptions) {
  var dataSourceOptions = processOptions(rawOptions);

  _.extend(mixinPrototype, {

    buildUrl: function () {
      var parts,
          result;

      parts = [dataSourceOptions.host, dataSourceOptions.baseUrl]
          .concat(slice.call(arguments));

      result = dataSourceOptions.protocol + '://' +
          path.join.apply(path, parts);

      return result + (result.slice(-1) !== '/' ? '/' : '');
    },

    makeRequest: function (relativeUrl, options) {
      var url = this.buildUrl(relativeUrl),
          deferred = Q.defer(),
          requestOptions;

      requestOptions = _.extend({}, dataSourceOptions.defaultRequestOptions, 
          options, { url: url });

      logger.info('Make request to URL: ' + url);
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
    }

  });

};

/// - Option processing --------------------------------------------------------

function processOptions(rawOptions) {
  var options = {};

  if (!_.isObject(rawOptions)) {
    logger.error('An options argument is required').andThrow();
  }

  verifyAndCopyStringProperties(['protocol', 'host'], rawOptions, options);

  if (_.isString(rawOptions.baseUrl)) {
    options.baseUrl = rawOptions.baseUrl;
  } else if (_.isUndefined(rawOptions.baseUrl)) {
    options.baseUrl = '';
  } else {
    logger.error('The "baseUrl" may only be a string or undefined').andThrow();
  }

  options.defaultRequestOptions = {};
  if (!_.isUndefined(rawOptions.requestOptions)) {
    _.extend(options.defaultRequestOptions, rawOptions.requestOptions);
  }

  if (_.isObject(rawOptions.auth)) {
    options.auth = {};
    options.defaultRequestOptions.auth = options.auth;
    verifyAndCopyStringProperties(['user', 'pass'], 
        rawOptions.auth, options.auth);
  }

  return options;
}

function verifyAndCopyStringProperties(properties, from, to) {
  properties.forEach(function (property) {
    if (_.isString(from[property])) {
      to[property] = from[property];
    } else {
      logger.error('The "' + property + '" property must be a valid string')
          .andThrow();
    }
  });
}