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
  this.definedEndpoints = {};
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
      data;

  logger.info('Prepare API file: ', fileName);
  data = require(path.join(this.apiPath, fileName));

  if (_.isString(data.rootUri)) {
    if (_.isArray(data.endpoints)) {
      this.prepareEndpoints(data.rootUri, data.endpoints);
    } else {
      logger.warn('Skip ', fileName, 
          ' because it does not specify any endpoints');
    }
  } else if (_.isString(data.uri)) {
    this.prepareEndpoint(data.uri, data);
  } else {
    logger.warn('Skip ', fileName, 
        ' because it does not specify any endpoints');
  }
};

Bootstrapper.prototype.prepareEndpoints = function (rootUri, endpoints) {
  logger.info('Preparing endpoints with root URI: ', 
      path.join('/', this.version, rootUri));
  endpoints.forEach(function (endpoint) {
    this.prepareEndpoint(rootUri, endpoint);
  }, this);
};

Bootstrapper.prototype.prepareEndpoint = function (rootUri, endpoint) {
  var relativeUri = _.isUndefined(endpoint.uri) ? '': endpoint.uri,
      uri = path.join('/', rootUri, relativeUri).replace(/\/+$/, '');

  // If there is not an entry in the hash for this URI, create one
  if (!this.definedEndpoints[uri]) {
    this.definedEndpoints[uri] = {};
  }

  // Define any endpoints that this endpoint supports
  REST_METHODS.forEach(function (method) {
    if (endpoint.hasOwnProperty(method)) {
      this.prepareEndpointMethod(uri, method, endpoint);
    }
  }, this);
};

Bootstrapper.prototype.prepareEndpointMethod = function (uri, method, endpoint) {
  var fullUri = path.join('/', this.version, uri);

  // If this endpoint and method has not yet been defined, define it
  if (!this.definedEndpoints[uri][method]) {
    logger.info(method.toUpperCase(), ' ', fullUri);
    if (_.isFunction(endpoint[method])) {
      this.app[method](fullUri, endpoint[method]);
    } else {
      logger.warn('Endpoint "', method.toUpperCase(), ' ', fullUri,
         '" does not have a valid handler');  
    }
    this.definedEndpoints[uri][method] = true;
  } else {
    logger.warn('Endpoint "', method.toUpperCase(), ' ', uri,
        '" is already defined');
  }

};

module.exports = function (parentApp, version) {
  new Bootstrapper(parentApp, version).bootstrap();
};