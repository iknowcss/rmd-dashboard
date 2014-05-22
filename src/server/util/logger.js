var _     = require('underscore'),
    slice = Array.prototype.slice;

function Logger(options) {
  this.template = _.template(options.format);
}

['info', 'warn', 'error'].forEach(function (type) {

  Logger.prototype[type] = function () {
    return log(this.template, type, slice.apply(arguments).join(''));
  };

});

function log(template, type, msg) {
  var data,
      logMsg;

  data = {
    type      : type,
    timestamp : new Date().toString(),
    msg       : msg
  };

  logMsg = template(data);

  console.log(logMsg);
  return buildLogReturn(type, logMsg);
};

function buildLogReturn(type, logMsg) {
  if (type === 'error') {
    return {
      andThrow: function () {
        throw new Error(logMsg);
      }
    };
  }
}

module.exports = new Logger({
  format: '[<%= type %>] <%= timestamp %> - <%= msg %>'
});