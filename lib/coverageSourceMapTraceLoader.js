'use strict';

var require$$0 = require('path');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

var coverageSourceMapTraceLoader$1;
var hasRequiredCoverageSourceMapTraceLoader;
function requireCoverageSourceMapTraceLoader() {
  if (hasRequiredCoverageSourceMapTraceLoader) return coverageSourceMapTraceLoader$1;
  hasRequiredCoverageSourceMapTraceLoader = 1;
  const path = require$$0;
  const CoverageSourceMapTracePlugin = require(path.resolve(__dirname, './index'));
  coverageSourceMapTraceLoader$1 = function (source, sourceMap) {
    // 过滤不含sourceMap的情况
    if (!sourceMap) {
      return source;
    }
    const {
      query,
      resourcePath
    } = this;
    let options = {};
    if (this.getOptions && typeof this.getOptions === 'function') {
      options = this.getOptions();
    } else if (query) {
      options = Object.prototype.toString.call(query) === '[object Object]' ? query : {};
    }
    if (!CoverageSourceMapTracePlugin.sourceMapCache.has(resourcePath)) {
      CoverageSourceMapTracePlugin.sourceMapCache.set(resourcePath, []);
    }
    CoverageSourceMapTracePlugin.sourceMapCache.get(resourcePath).unshift(_objectSpread2(_objectSpread2({}, options), {}, {
      resourcePath,
      sourceMap
    }));
    return source;
  };
  return coverageSourceMapTraceLoader$1;
}

var coverageSourceMapTraceLoaderExports = requireCoverageSourceMapTraceLoader();
var coverageSourceMapTraceLoader = /*@__PURE__*/getDefaultExportFromCjs(coverageSourceMapTraceLoaderExports);

module.exports = coverageSourceMapTraceLoader;
