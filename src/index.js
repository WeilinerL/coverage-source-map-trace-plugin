const path = require('path')
const coverageSourceMapTraceLoader = path.resolve(__dirname, './coverageSourceMapTraceLoader.js')
const coverageSourceMapTraceBabelPlugin = path.resolve(__dirname, './coverageSourceMapTraceBabelPlugin.js')
const unBlockList = ['cache-loader/dist/cjs.js']
const babelEntry = 'babel-loader/lib/index.js'

class CoverageSourceMapTracePlugin {
  static sourceMapCache = new Map()

  get name() {
    return this.constructor.name
  }

  intercept(module) {
    const requestList = module.request.split('!')
    const [requestPath] = requestList.pop().split('?')
    // 当前模块儿使用到了babel，则需要对其进行sourceMap溯源
    const hasBabel =
      module.loaders.findIndex(l => l.loader.endsWith(babelEntry)) > -1

    // hot reload
    if (CoverageSourceMapTracePlugin.sourceMapCache.has(requestPath)) {
      CoverageSourceMapTracePlugin.sourceMapCache.set(requestPath, [])
    }

    if (hasBabel) {
      // 过滤应用到script部分的loader
      module.loaders = module.loaders.filter(l => ![coverageSourceMapTraceLoader].includes(l.loader))
      const babelLoaderIndex = module.loaders.findIndex(l => l.loader.endsWith(babelEntry))
      const babelLoader = module.loaders[babelLoaderIndex]
      // 处理到babel-loader就可以了，因为插桩是基于babel-plugin-istanbul的，sourceMap采集到这里即可
      const postLoaders = module.loaders.slice(babelLoaderIndex + 1)

      // 在每个loader之间加一个自定义的loader，用于采集sourceMap信息
      module.loaders = module.loaders.slice(0, babelLoaderIndex + 1).concat(
        postLoaders.reduce((loaders, currentLoader) => {
          if (currentLoader.loader === coverageSourceMapTraceLoader) {
            return loaders
          }
          // 过滤掉不需要收集sourceMap的loader
          if (unBlockList.find(l => currentLoader.loader.endsWith(l))) {
            loaders.push(currentLoader)
            return loaders
          }
          loaders.push({
            loader: coverageSourceMapTraceLoader,
            options: {
              // 记录上层loader
              preLoader: currentLoader.loader
            }
          }, currentLoader)
          return loaders
        }, [])
      )
      babelLoader.options = (typeof babelLoader.options === 'string'
        ? JSON.parse(babelLoader.options)
        : babelLoader.options) || { plugins: [] }
      babelLoader.options.plugins = babelLoader.options.plugins || []
      if (!babelLoader.options.plugins.includes(coverageSourceMapTraceBabelPlugin)) {
        babelLoader.options.plugins.push(coverageSourceMapTraceBabelPlugin)
      }
    }
  }

  apply(compiler) {
    // webpack4及以上
    if (compiler.hooks) {
      compiler.hooks.compilation.tap(this.name, compilation => {
        compilation.hooks.normalModuleLoader.tap(
          this.name,
          (loaderContext, module) => {
            this.intercept(module)
          }
        )
      })
    } else {
      // 处理webpack 3
      compiler.plugin('normal-module-factory', normalModuleFactory => {
        normalModuleFactory.plugin('after-resolve', (module, callback) => {
          this.intercept(module)
          callback(null, module)
        })
      })
    }
  }
}

module.exports = CoverageSourceMapTracePlugin
