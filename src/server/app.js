var nconf   = require('nconf'),
    app     = require('express')(),
    logger  = require('./util/logger'),
    server;

// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

// Then load configuration from a designated file.
nconf.file({ file: './config/config.json' });

// Provide default values for settings not provided above.
nconf.defaults({
  express: {
    port: process.env.PORT
  },
  request: {
    'reject-unauthorized': true
  }
});

// Export the express parent
module.exports = app;

// Apply API handlers
require('./api/boot')(app, 'v1');

// Apply UI handlers
require('./ui/boot')(app);

// Handle 404s
app.use(function (req, res) {
  res.status(404).send('');
})

// Only start the server if this module was not loaded from
// another module
if (!module.parent) {
  server = app.listen(nconf.get('express:port'), function () {
    logger.info('Listening on port: ', server.address().port);
  });
}