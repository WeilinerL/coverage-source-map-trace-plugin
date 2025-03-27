const path = require('path')
const CoverageSourceMapTracePlugin = require(path.resolve(__dirname, './index'))

module.exports = function (source, sourceMap) {
  // 过滤不含sourceMap的情况
  if (!sourceMap) {
    return source
  }

  const { query, resourcePath } = this
  let options = {}
  if (this.getOptions && typeof this.getOptions === 'function') {
    options = this.getOptions()
  } else if (query) {
    options = Object.prototype.toString.call(query) === '[object Object]' ? query : {}
  }

  if (!CoverageSourceMapTracePlugin.sourceMapCache.has(resourcePath)) {
    CoverageSourceMapTracePlugin.sourceMapCache.set(resourcePath, [])
  }
  CoverageSourceMapTracePlugin.sourceMapCache.get(resourcePath).unshift({
    ...options,
    resourcePath,
    sourceMap,
  })

  return source
}
