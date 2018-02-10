import resolveGlobal from 'resolve-global'

const LOADER_PREFIX = 'go-loader-'
const DEFAULT_LOADER_NAME = 'git'

const normalizeName = (name) =>
  LOADER_PREFIX + (name || DEFAULT_LOADER_NAME).toString().trim().toLowerCase()

const resolve = (name) => {
  name = normalizeName(name)

  try {
    return require.resolve(name)
  } catch (err) {
    return resolveGlobal(name)
  }
}

const requireLoader = (name) => {
  let loaderPath
  try {
    loaderPath = resolve(name)
  } catch (err) {
    return null
  }

  return require(loaderPath)
}

export default requireLoader
export { resolve, normalizeName }
