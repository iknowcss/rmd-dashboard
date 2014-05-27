var nconf   = require('nconf'),
    _       = require('underscore')
    path    = require('path'),
    Q       = require('q'),
    request = require('request'),

    logger  = require('../util/logger'),

    slice      = Array.prototype.slice;

/// - Request defaults ---------------------------------------------------------

nconf.defaults({
  request: {
    'reject-unauthorized': true
  }
});

/// - Mixin applier ------------------------------------------------------------

module.exports = function (mixinPrototype, rawOptions) {
  var dataSourceOptions = processOptions(rawOptions);

  _.extend(mixinPrototype, {

    buildUrl: function () {
      var parts,
          result;

      // Get the arguments as an array
      parts = slice.call(arguments);

      // Put the baseUrl at the front of the array end with a forward-slash
      parts.unshift('/' + dataSourceOptions.baseUrl);
      parts.push('/');

      // Construct the full URL
      result = dataSourceOptions.protocol + '://' +
          dataSourceOptions.host + 
          (!_.isUndefined(dataSourceOptions.port) ?
              ':' + dataSourceOptions.port : '') +
          path.join.apply(path, parts);

      return result;
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

  copyProperties(['protocol', 'host'], copyNonEmptyString, rawOptions, options);
  copyProperties(['baseUrl'], copyString, rawOptions, options);
  copyProperties(['port'], copyIntegerOrUndefined, rawOptions, options);

  options.defaultRequestOptions = {
    rejectUnauthorized: nconf.get('request:reject-unauthorized')
  };
  if (!_.isUndefined(rawOptions.requestOptions)) {
    _.extend(options.defaultRequestOptions, rawOptions.requestOptions);
  }

  if (_.isObject(rawOptions.auth)) {
    options.auth = {};
    options.defaultRequestOptions.auth = options.auth;
    copyProperties(['user', 'pass'], copyNonEmptyString,
        rawOptions.auth, options.auth);
  }

  return options;
}

/// - Copy util ----------------------------------------------------------------

function copyProperties(properties, coppier, from, to) {
  properties.forEach(function (property) {
    coppier(property, from, to);
  });
}

function copyNonEmptyString(property, from, to) {
  if (from[property] && _.isString(from[property])) {
    to[property] = from[property];
  } else {
    logger
      .error('The "' + property + '" property must be a non-empty string')
      .andThrow();
  }
}

function copyString(property, from, to) {
  if (_.isString(from[property])) {
    to[property] = from[property];
  } else {
    logger
      .error('The "' + property + '" property must be a string')
      .andThrow();
    }
}

function copyIntegerOrUndefined(property, from, to) {
  if (_.isUndefined(from[property]) || ~~from[property] === from[property]) {
    to[property] = from[property];
  } else {
    logger
      .error('The "' + property + '" property must be an integer or undefined')
      .andThrow();
    }
}