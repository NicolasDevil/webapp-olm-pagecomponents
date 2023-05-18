const path = require('path')
function resolve(dir) { return path.join(__dirname, dir) }
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    }
  },
  chainWebpack: (config) => {
    config.module
      .rule('js')
      .include
      .add(path.resolve(__dirname, 'packages'))
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap((options) => {
        return options
      })
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('package'),
        '~': resolve('examples')
      }
    }
  }
})
