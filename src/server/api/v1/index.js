module.exports = {

  uri: '/',

  get: function (req, resp) {
    resp.send({ started: true });
  }

};