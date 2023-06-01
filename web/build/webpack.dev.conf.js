const base = require('./webpack.base.conf')

module.exports = Object.assign({}, base, {
  devServer: {
    port: 8877,
    historyApiFallback: true,
    host: '0.0.0.0',
    proxy: {
      '*': {
        target: 'http://127.0.0.1:8080/',
        source: false,
        changeOrigin: true,
      },
    },
  },
  mode: 'development',
})
