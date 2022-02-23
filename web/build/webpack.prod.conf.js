const path = require("path");
const base = require("./webpack.base.conf");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = Object.assign({}, base, {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [new CleanWebpackPlugin(), ...base.plugins],
  mode: "production",
});
