var app     = require('express')(),
    logger  = require('./util/logger'),
    server;

// Export the express parent
module.exports = app;

// Apply API handlers
require('./api/boot')(app, 'v1');

// Only start the server if this module was not loaded from
// another module
if (!module.parent) {
  server = app.listen(process.env.PORT, function () {
    logger.info('Listening on port: ', server.address().port);
  });
}