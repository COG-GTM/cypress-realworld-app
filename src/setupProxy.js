const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      target: `http://localhost:${process.env.BACKEND_PORT}`,
      changeOrigin: true,
      pathFilter: ["/login", "/callback", "/logout", "/checkAuth", "/graphql"],
    })
  );
};
