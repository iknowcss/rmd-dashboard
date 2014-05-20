var request = require('request'),
    Q       = require('q');

module.exports = {
  
  getLatestFavoritePlans: function () {
    var deferred = Q.defer(),
        options;

    options = {
      json: true,
      auth: {
        user: '',
        pass: ''
      },
      url: 'https://host/rest/api/latest/plan/',
      qs: {
        favourite: true
      }
    };

    request.get(options, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        deferred.resolve(body, res);
      } else {
        deferred.reject({
          error: error,
          statusCode: res.statusCode
        });
      }
    });

    return deferred.promise;
  }

};