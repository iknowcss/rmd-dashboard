var fs      = require('fs'),
    nconf   = require('nconf'),
    express = require('express'),
    _       = require('underscore'),

    logger  = require('./util/logger'),

    app,
    server;

module.exports = function (configPath) {
  var apiVersion,
      expressPort;

  // Don't start if the server is already started
  if (server) {
    logger.error('Server is already running').andThrow();
  }

  // Don't continue if there is no config file
  if (!_.isString(configPath)) {
    logger.error('No config file specified').andThrow();
  } else if (!fs.existsSync(configPath)) {
    logger.error('Config file "' + configPath + '" does not exist').andThrow();
  } else {
    logger.info('Using config file: ' + configPath);
  }

  // Load configuration from a config JSON
  nconf.file(configPath);

  // Override config with any command line arguments or environment variables
  nconf.argv().env();

  // Verify API configuration
  apiVersion = nconf.get('api:version');
  if (!apiVersion) {
    logger
      .error('Config setting "api:version" is not a valid string')
      .andThrow();
  }

  // Verify express port configuration
  expressPort = nconf.get('express:port');
  if (!expressPort || ~~expressPort !== expressPort || expressPort <= 0) {
    logger
      .error('Config setting "express:port" is not a valid port number')
      .andThrow();
  }

  // Prepare the app
  app = express();

  // Handlers
  require('./api/boot')(app, apiVersion);
  require('./ui/boot')(app);

  // Global 404
  app.use(function (req, res) {
    logger.warn('404 Not found: ' + req.url);
    res.status(404).send('404 Not found');
  })

  // Start
  server = app.listen(expressPort, function () {
    logger.info('Listening on port: ', server.address().port);
  });

};