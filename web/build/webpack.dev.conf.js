const base = require("./webpack.base.conf");

module.exports = Object.assign({}, base, {
  devServer: {
    port: 9010,
    historyApiFallback: true,
    host: "127.0.0.1",
  },
  mode: "development",
});
