const express = require('express')
const app = new express()
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const { createBundleRenderer } = require('vue-server-renderer')
const isProduction = process.env.NODE_ENV === 'production'
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-renderer/${require('vue-server-renderer/package.json').version}`

const resolve = file => path.resolve(__dirname, file)

// 生成服务端渲染函数
let renderer
let readyPromise
const templatePath = resolve('./index.html')
if (isProduction) {
  renderer = createBundleRenderer(require('./dist/vue-ssr-server-bundle.json'), {
    // 推荐
    runInNewContext: false,
    // 模板html文件
    template: fs.readFileSync(templatePath, 'utf-8'),
    // client manifest
    clientManifest: require('./dist/vue-ssr-client-manifest.json')
  })
} else {
  readyPromise = require('./build/dev-server')(app, templatePath, (bundle, options) => {
    renderer = createBundleRenderer(bundle, {
      // 推荐
      cache: LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false,
      ...options
    })
  })
}

app.use(express.static('./dist'))

function render(req, res) {
  const context = {
    title: '服务端渲染测试',
    url: req.url
  }

  res.set('Content-Type', 'text/html')
  res.set('Server', serverInfo)

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if (err.code === 404) {
      res.status(404).send('404 | Page Not Found')
    } else {
      res.status(500).send('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err.stack)
    }
  }

  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.send(html)
  })
}

app.use(
  isProduction
    ? render
    : (req, res) => {
        readyPromise.then(() => render(req, res))
      }
)

app.listen(3000)
