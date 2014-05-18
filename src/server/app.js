var express = require('express'),
    app,
    server;

app = express();

server = app.listen(process.env.PORT, function () {
  console.log('Listening on port %d', server.address().port);
});

module.exports = app;