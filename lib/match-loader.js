const { requireLoader, normalizeLoaderName } = require('./utils')
const installPackage = require('./install-package')

const matchLoader = (args, env) => new Promise((resolve, reject) => {
  const loaderName = normalizeLoaderName(args[0])
  if (!loaderName) return resolve(null)

  const loader = requireLoader(loaderName)
  if (!loader) return resolve(null)

  if (!loader || typeof loader.execute !== 'function') {
    return reject(new Error(`${loaderName} should export 'execute' method`))
  }

  const processResult = (result) => {
    if (result && result.install && result.path) {
      return installPackage(result.path)
    }
  }

  const executor = () => new Promise((resolve) => {
    resolve(loader.execute({ args, env }))
  }).then(processResult)

  resolve(executor)
})

module.exports = matchLoader
