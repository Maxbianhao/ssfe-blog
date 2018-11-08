const merge = require('webpack-merge')
const base = require('./webpack.base.conf')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const config = merge(base, {
  entry: {
    app: './src/entry-client.js'
  },
  plugins: [new VueSSRClientPlugin()]
})

module.exports = config
