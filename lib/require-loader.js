var resolveGlobal = require('resolve-global')

var LOADER_PREFIX = 'go-loader-'
var DEFAULT_LOADER_NAME = 'git'

function normalizeLoaderName (name) {
  return LOADER_PREFIX + (name || DEFAULT_LOADER_NAME).toString().trim().toLowerCase()
}

function resolveLoader (name) {
  name = normalizeLoaderName(name)

  try {
    return require.resolve(name)
  } catch (err) {
    return resolveGlobal(name)
  }
}

function requireLoader (name) {
  try {
    var loaderPath = resolveLoader(name)
  } catch (err) {
    return null
  }

  return require(loaderPath)
}

module.exports = requireLoader
module.exports.resolve = resolveLoader
module.exports.normalizeName = normalizeLoaderName
