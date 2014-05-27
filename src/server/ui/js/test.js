(function () {

  function ExampleViewModel() {
    var self = this;

    self.currentTime = ko.observable();

    function updateTime() {
      self.currentTime(~~(new Date().getTime() / 1000));
    }

    updateTime();
    setInterval(updateTime, 500);
  }

  window.addEventListener('load', function () {
    ko.applyBindings(new ExampleViewModel());
  });

}());