const resolveGlobal = require('resolve-global')

const LOADER_PREFIX = 'go-loader-'

const normalizeLoaderName = (name) => typeof name === 'string'
  ? LOADER_PREFIX + name.trim().toLowerCase()
  : null

const resolveLoader = (name) => {
  try {
    return require.resolve(name)
  } catch (err) {
    return resolveGlobal(name)
  }
}

const requireLoader = (name) => {
  let loaderPath
  try {
    loaderPath = resolveLoader(name)
  } catch (err) {
    return null
  }

  // out of the try catch so parsing errors will show up
  return require(loaderPath)
}

module.exports.requireLoader = requireLoader
module.exports.resolveLoader = resolveLoader
module.exports.normalizeLoaderName = normalizeLoaderName
