const base = require('./webpack.base.conf')

module.exports = Object.assign({}, base, {
  devServer: {
    port: 8877,
    historyApiFallback: true,
    host: '127.0.0.1',
    proxy: {
      '*': {
        target: 'http://14.116.241.63:8080/',
        source: false,
        changeOrigin: true,
      },
    },
  },
  mode: 'development',
})
