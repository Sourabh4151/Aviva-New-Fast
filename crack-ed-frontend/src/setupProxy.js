// Prevent dev-server from proxying missing /favicon.ico requests to backend.
// The browser may request /favicon.ico automatically; if the file is missing,
// Create React App's proxy setting will forward the request to the backend
// (causing ECONNREFUSED when the backend is down). Respond with 204 to stop that.
module.exports = function (app) {
  app.use('/favicon.ico', (req, res) => {
    res.status(204).end();
  });
};
