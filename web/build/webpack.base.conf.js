const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  entry: {
    main: "./src/index.tsx",
  },
  output: {
    filename: "static/js/polaris-console.js",
    path: path.resolve(__dirname, "../dist"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "./images/[name].[hash:8].[ext]",
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          "url-loader",
          "svg-transform-loader",
          {
            loader: "svgo-loader",
            options: {
              plugins: [{ removeTitle: true }, { convertStyleToAttrs: true }],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@src": path.resolve(__dirname, "../src"),
    },
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        terserOptions: { output: { comments: false } },
      }),
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `static/css/polaris-console.css`,
    }),
    new MonacoWebpackPlugin({
      // 所需语言支持
      languages: ["json", "yaml", "ini", "xml"],
      // targetName 业务名
      filename: `static/js/[name].js`,
      customLanguages: [
        {
          label: 'yaml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker',
          },
        },
        {
          label: 'yml',
          entry: 'monaco-yaml',
          worker: {
            id: 'monaco-yaml/yamlWorker',
            entry: 'monaco-yaml/yaml.worker',
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/assets/index.html",
      minify: !isDev,
      publicPath: "",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.BUILD_TYPE": JSON.stringify(process.env.BUILD_TYPE),
    }),
  ],
};
