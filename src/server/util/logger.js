var _     = require('underscore'),
    slice = Array.prototype.slice;

function Logger(options) {
  this.template = _.template(options.format);
}

['info', 'warn', 'error'].forEach(function (type) {

  Logger.prototype[type] = function () {
    log(this.template, type, slice.apply(arguments).join(''));
  };

});

function log(template, type, msg) {
  var data = {
    type      : type,
    timestamp : new Date().toString(),
    msg       : msg
  };
  console.log(template(data));
};

module.exports = new Logger({
  format: '[<%= type %>] <%= timestamp %> - <%= msg %>'
});