var fs      = require('fs'),
    path    = require('path'),
    express = require('express'),
    _       = require('underscore'),

    logger  = require('../util/logger');

function Bootstrapper(parentApp) {
  this.parentApp = parentApp;
  this.app = express();
  this.htmlPath = path.join(__dirname, 'html');
}

_.extend(Bootstrapper.prototype, {

  bootstrap: function () {
    this.prepareUiApp();
    this.prepareStaticResources();
    this.parentApp.use(this.app);
  },

  prepareUiApp: function () {
    logger.info('Start UI using HTML path: ' + this.htmlPath);
    fs.readdirSync(this.htmlPath).forEach(this.prepareHtmlFile, this);
  },

  prepareStaticResources: function () {
    var uiPath = path.join(__dirname + '../../../../target/resource');
    logger.info('Use static resources at: ' + uiPath);
    this.app.use('/resource', express.static(uiPath));
  },

  prepareHtmlFile: function (fileName) {
    var self = this,
        match = fileName.match(/([^\/\\]+)\.(?:html?)$/),
        relativeUri,
        uri;

    if (match) {
      logger.info('Prepare UI file: ' + fileName);
      relativeUri = match[1];
      if (relativeUri === 'index') {
        relativeUri = '/';
      }
      uri = path.join('/ui/' + relativeUri);
      logger.info('Prepare ' + uri);
      this.app.get(uri, function (req, res) {
        logger.info('GET ' + uri);
        res.sendfile(path.join(self.htmlPath, fileName));
      });
    } else {
      logger.warn('Skip UI file: ' + fileName);
    }
  }

});

module.exports = function (parentApp) {
  new Bootstrapper(parentApp).bootstrap();
};