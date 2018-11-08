const fs = require('fs')
const path = require('path')
// 写入内存
const MFS = require('memory-fs')
const webpack = require('webpack')
const clientConfig = require('./webpack.client.conf')
const serverConfig = require('./webpack.server.conf')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {}
}

module.exports = function setupDevServer(app, templatePath, cb) {
  let bundle
  let template
  // 服务器渲染生成的前端文件
  let clientManifest

  // 闭包promise resolve
  let ready
  const readyPromise = new Promise(resolve => {
    ready = resolve
  })
  const update = () => {
    if (bundle && clientManifest) {
      ready()
      cb(bundle, {
        template,
        clientManifest
      })
    }
  }

  template = fs.readFileSync(templatePath, 'utf-8')

  // 客户端代码更新
  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin())
  let clientCompiler = webpack(clientConfig)
  let devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    noInfo: true,
    publicPath: clientConfig.output.publicPath
  })
  app.use(devMiddleware)
  clientCompiler.plugin('done', stats => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return
    clientManifest = JSON.parse(readFile(devMiddleware.fileSystem, 'vue-ssr-client-manifest.json'))
    update()
  })

  // 自动刷新页面
  app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))

  // 服务器渲染更新
  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    if (stats.errors.length) return

    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
    update()
  })

  return readyPromise
}
