var path    = require('path'),
    request = require('request'),
    nconf   = require('nconf'),
    Q       = require('q');

module.exports = {
  
  getLatestFavoritePlans: function () {
    var deferred = Q.defer(),
        options;

    options = {
      json: true,
      auth: {
        user: nconf.get('bamboo-rest:user'),
        pass: nconf.get('bamboo-rest:pass')
      },
      url: nconf.get('bamboo-rest:baseUrl') + '/rest/api/latest/plan/',
      qs: {
        favourite: true
      }
    };

    request.get(options, function (error, res, body) {
      console.log(arguments)
      if (!error && res.statusCode === 200) {
        deferred.resolve(body, res);
      } else {
        deferred.reject({
          error: error,
          statusCode: res ? res.statusCode : error.code
        });
      }
    });

    return deferred.promise;
  }

};