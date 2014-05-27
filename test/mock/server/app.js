var nconf   = require('nconf'),
    app     = require('express')(),
    path    = require('path'),
    logger  = require('../../../src/server/util/logger'),
    mock,
    server;

/// - Mock config defaults -----------------------------------------------------

nconf.defaults({ mock: {
  express: {
    port: 3030
  }
}});

/// - Export the express parent ------------------------------------------------

module.exports = app;

/// - Apply handlers -----------------------------------------------------------

require('./mock-bamboo-boot')(app);

// Handle 404s
app.use(function (req, res) {
  res.status(404).json({ error: 'Not found' });
});

/// - Start the server ---------------------------------------------------------

server = app.listen(nconf.get('mock:express:port'), function () {
  logger.info('Mock listening on port: ', server.address().port);
});