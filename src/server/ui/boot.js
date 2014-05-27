var fs      = require('fs'),
    path    = require('path'),
    express = require('express'),
    _       = require('underscore'),

    logger  = require('../util/logger')

function Bootstrapper(parentApp) {
  this.parentApp = parentApp;
  this.app = express();
  this.htmlPath = path.join(__dirname, '../../ui/html');
}

_.extend(Bootstrapper.prototype, {

  bootstrap: function () {
    this.prepareUiApp();
    this.prepareMiddleware();
    this.parentApp.use(this.app);
  },

  prepareUiApp: function () {
    logger.info('Start UI using HTML path: ' + this.htmlPath);
    fs.readdirSync(this.htmlPath).forEach(this.prepareHtmlFile, this);
  },

  prepareMiddleware: function () {
    var uiDir     = path.join(__dirname, '../../ui'),
        libDir    = path.join(__dirname, '../../../lib'),
        lessSrc   = path.join(uiDir, '/less'),
        libJsSrc  = path.join(libDir, '/js'),
        jsSrc     = path.join(uiDir, '/js');

    // Less
    logger.info('Prepare CSS middleware: ' + lessSrc);
    this.app.use('/resource/css', require('less-middleware')(lessSrc));
    this.app.use('/resource/css', express.static(lessSrc));

    // Uglify UI JavaScript
    logger.info('Prepare JavaScript lib middleware: ' + libJsSrc);
    this.app.use('/resource/lib/js', express.static(libJsSrc));

    // Uglify UI JavaScript
    logger.info('Prepare JavaScript middleware: ' + jsSrc);
    this.app.use('/resource/js', require('uglifyjs-middleware')(jsSrc));
    this.app.use('/resource/js', express.static(jsSrc));
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
        relativeUri = '';
      }
      uri = path.join('/ui', relativeUri);
      logger.info('Prepare ' + uri);
      this.app.use(uri, function (req, res) {
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