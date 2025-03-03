# coverage-source-map-trace-plugin

解决loader对源码二次编译，导致babel-plugin-istanbul采集的覆盖率数据相对于源码存在偏移的问题

**兼容webpack 3、4、5**

## 使用方法

### 1. 安装
```
npm install coverage-source-map-trace-plugin -D
```

### 2. 配置

#### vue-cli
在项目根目录的`vue.config.js`文件中添加以下代码：

```js
const CoverageSourceMapTracePlugin = require('coverage-source-map-trace-plugin')

module.exports = {
  chainWebpack: config => {
    config
      .plugin('coverage-source-map-trace-plugin')
      .use(CoverageSourceMapTracePlugin)
  }
}
```

#### webpack.config.js

```js
const CoverageSourceMapTracePlugin = require('coverage-source-map-trace-plugin')

module.exports = {
  plugins: [
    new CoverageSourceMapTracePlugin()
  ]
}
```


[历史版本](https://www.npmjs.com/package/coverage-source-map-trace-plugin)