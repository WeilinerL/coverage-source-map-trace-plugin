const path = require('path')
const babelTraverse = require('@babel/traverse').default
const CoverageSourceMapTracePlugin = require(path.resolve(__dirname, './index'))
const { SourceMapConsumer } = require('source-map')

function modifyStartAndEnd(t, node, callback) {
  if (t.isObjectExpression(node)) {
    // 遍历对象的属性
    node.properties.forEach(property => {
      // 检查属性名是否是 'start' 或 'end'
      if (
        t.isIdentifier(property.key) &&
        (property.key.name === 'start' || property.key.name === 'end')
      ) {
        callback(property)
      }

      // 如果属性值是对象或数组，再递归检查
      if (
        t.isObjectExpression(property.value) ||
        t.isArrayExpression(property.value)
      ) {
        modifyStartAndEnd(t, property.value, callback)
      }
    })
  } else if (t.isArrayExpression(node)) {
    // 如果是数组表达式，递归检查数组中的每个元素
    node.elements.forEach(element => {
      if (t.isObjectExpression(element)) {
        modifyStartAndEnd(t, element, callback)
      }
    })
  }
}

module.exports = function({ types: t }) {
  return {
    name: 'coverage-source-map-trace-babel-plugin',
    post(state) {
      const ast = state.ast
      const { filename } = this
      const sourceMapList =
        CoverageSourceMapTracePlugin.sourceMapCache.get(filename) || []
      if (sourceMapList.length) {
        const consumers = sourceMapList.map(({ preLoader, sourceMap }) => ({
          preLoader,
          consumer: new SourceMapConsumer(sourceMap)
        }))
        babelTraverse(ast, {
          enter(path) {
            if (path.isVariableDeclaration()) {
              path.node.declarations.forEach(declarator => {
                if (declarator.id.name === 'coverageData') {
                  // 避免用户自定义属性干扰，导致误判
                  const isCoverageData =
                    declarator.init &&
                    declarator.init.properties &&
                    declarator.init.properties.filter(property =>
                      ['statementMap', 'fnMap', 'branchMap'].includes(
                        property.key.name
                      )
                    ).length >= 3
                  if (!isCoverageData) {
                    return
                  }
                  const convertedLoaders = new Set()
                  modifyStartAndEnd(t, declarator.init, property => {
                    const [line, column] = property.value.properties
                    if (
                      line &&
                      column &&
                      line.key.name === 'line' &&
                      column.key.name === 'column'
                    ) {
                      const currentPos = {
                        line: line.value.value,
                        column: column.value.value,
                      }
                      for (const { consumer, preLoader } of consumers) {
                        const pos = consumer.originalPositionFor(currentPos)
                        if (!pos.source) {
                          currentPos.line = null
                          currentPos.column = null
                          break
                        }
                        currentPos.line = pos.line
                        currentPos.column = pos.column
                        typeof preLoader === 'string' && convertedLoaders.add(preLoader)
                      }
                      line.value.value = currentPos.line
                      column.value.value = currentPos.column
                    }
                  })
                  const innerArray = t.arrayExpression(
                    [...convertedLoaders].map(l => t.StringLiteral(l))
                  )
                  const _converted = t.objectProperty(
                    t.identifier('_tracedSourceMapList'),
                    innerArray
                  )
                  declarator.init.properties.push(_converted)
                }
              })
            }
          }
        })
      }
    }
  }
}
