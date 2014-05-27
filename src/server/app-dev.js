var nconf   = require('nconf'),
    app     = require('express')(),
    logger  = require('./util/logger'),
    server;

/// - Export -------------------------------------------------------------------

module.exports = app;

/// - Configuration ------------------------------------------------------------

// Set default values for several settings
nconf.defaults({
  express: {
    port: process.env.PORT
  },
  request: {
    'reject-unauthorized': true
  }
});

// Override defaults with any command line arguments or environment variables
nconf.argv().env();

// Load configuration from a config JSON
nconf.file({ file: './config/config-dev.json' });

/// - Handlers -----------------------------------------------------------------

require('./api/boot')(app, 'v1');
require('./ui/boot')(app);

app.use(function (req, res) {
  res.status(404).send('');
})

/// - Start --------------------------------------------------------------------

server = app.listen(nconf.get('express:port'), function () {
  logger.info('Listening on port: ', server.address().port);
});