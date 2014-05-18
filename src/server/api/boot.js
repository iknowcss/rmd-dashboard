var fs      = require('fs'),
    path    = require('path'),
    express = require('express'),
    _       = require('underscore'),

    logger  = require('../util/logger'),

    REST_METHODS = ['get', 'put', 'post', 'delete'];

function Bootstrapper(parentApp, version) {
  this.parentApp = parentApp;
  this.app = express();
  this.version = version;
  this.apiPath = path.join(__dirname, version);
  this.endpoints = {};
}

Bootstrapper.prototype.bootstrap = function () {
  this.prepareApiApp();
  this.parentApp.use(this.app);
  this.parentApp.use(function (req, res) {
    res.status(404).send('');
  });
};

Bootstrapper.prototype.prepareApiApp = function () {
  logger.info('Start API ', this.version, ' using path: ', this.apiPath);
  fs.readdirSync(this.apiPath).forEach(this.prepareApiFile, this);
};

Bootstrapper.prototype.prepareApiFile = function (fileName) {
  var uri,
      obj;

  logger.info('Prepare API file: ', fileName);
  obj = require(path.join(this.apiPath, fileName));

  if (_.isString(obj.uri)) {
    uri = path.join('/', this.version, obj.uri);

    REST_METHODS.forEach(function (method) {
      if (!_.isUndefined(obj[method])) {
        this.prepareEndpoint(fileName, uri, method, obj);
      }
    }, this);

  } else {
    logger.warn('Skip ', fileName, ' because it does not specify a valid uri');
  }
};

Bootstrapper.prototype.prepareEndpoint = function (fileName, uri, method, obj) {
  if (!this.endpoints.hasOwnProperty(uri)) {
    this.endpoints[uri] = {};
  }

  if (!this.endpoints[uri].hasOwnProperty(method)) {
    logger.info(method.toUpperCase(), ' ', uri);
    if (_.isFunction(obj[method])) {
      this.app[method](uri, obj[method]);
    }
    this.endpoints[uri][method] = fileName;
  } else {
    logger.warn('The endpoint "', method.toUpperCase(), ' ', uri,
        '" is already defined in ', this.endpoints[uri][method]);
  }
};

module.exports = function (parentApp, version) {
  new Bootstrapper(parentApp, version).bootstrap();
};