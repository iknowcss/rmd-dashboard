(function (_, $, ko) {

/// - Constants ----------------------------------------------------------------

var TEN_SECONDS = 10000,
    URL;

URL = {
  bambooBuildBoard: '/api/v1/bamboo-build-status/build-board'
};

/// - ViewModel constructor ----------------------------------------------------

function BuildBoard() {
  this.builds = ko.observableArray();
  this.startLoadBuildsInterval();
}

/// - ???? --------------------------------------------------------

_.extend(BuildBoard.prototype, {

  stateCss: function (state) {
    var stateLower;
    if (!state) {
      return;
    }

    stateLower = state.toLowerCase();
    switch (stateLower) {
      case 'successful':
      case 'failed':
        return 'build-state-' + stateLower;
      default:
        return 'build-state-unknown'
    }
  },

  stateIconCss: function (state) {
    var stateLower;
    if (!state) {
      return;
    }

    stateLower = state.toLowerCase();
    switch (stateLower) {
      case 'successful':
        return 'icon-ok'
      case 'failed':
        return 'icon-cancel';
      default:
        return ''
    }
  }

});

/// - AJAX --------------------------------------------------------

_.extend(BuildBoard.prototype, {

  startLoadBuildsInterval: function () {
    if (!this.loadBuildInterval) {
      this.loadBuilds();
      this.loadBuildInterval = setInterval(_.bind(function () {
        this.loadBuilds();
      }, this), TEN_SECONDS);
    }
  },

  stopLoadBuildsInterval: function () {
    if (this.loadBuildInterval) {
      clearInterval(this.loadBuildInterval);
    }
  },

  loadBuilds: function () {
    var options = {
      context   : this,
      url       : URL.bambooBuildBoard,
      method    : 'get',
      type      : 'json'
    };

    $.ajax(options)
      .done(this.processBuilds)
      .fail(this.stopLoadBuildsInterval);
  },

  processBuilds: function (data) {
    var builds = data.results;
    this.builds(builds);
  }

});

/// - Apply KO bindings --------------------------------------------------------

$(function () {
  ko.applyBindings(new BuildBoard());
});


}(window._, window.jQuery, window.ko));