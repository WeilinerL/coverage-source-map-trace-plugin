const path = require('path')
const json = require('@rollup/plugin-json')
const babel = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve')

const generateConfig = (input, output, external = [], plugins = []) => {
  return {
    input,
    output,
    external,
    plugins: [
      resolve(),
      commonjs({
        ignoreDynamicRequires: true
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: '8',
              },
              useBuiltIns: 'entry',
              corejs: 3
            },
          ],
        ],
      }),
      json(),
      ...plugins
    ]
  }
}

const configList = [
  generateConfig(path.resolve('./src/index.js'), {
    file: './lib/index.js',
    format: 'cjs',
    sourcemap: false,
  }),
  generateConfig(path.resolve('./src/coverageSourceMapTraceLoader.js'), {
    file: './lib/coverageSourceMapTraceLoader.js',
    format: 'cjs',
    sourcemap: false,
  }, ['.']),
  generateConfig(path.resolve('./src/coverageSourceMapTraceBabelPlugin.js'), {
    file: './lib/coverageSourceMapTraceBabelPlugin.js',
    format: 'cjs',
    sourcemap: false,
  }, ['@babel/traverse', 'source-map', '.'])
]
module.exports = configList
