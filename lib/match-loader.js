const { requireLoader, normalizeLoaderName } = require('./utils')
const installPackage = require('./install-package')

const matchLoader = (args, env) => new Promise((resolve, reject) => {
  const loaderName = normalizeLoaderName(args[0])
  if (!loaderName) return resolve(null)

  const loader = requireLoader(null)
  if (!loader) return resolve(null)

  if (!loader || typeof loader.execute !== 'function') {
    return reject(`${loaderName} should export 'execute' method`)
  }

  const processResult = (result) => {
    if (result && result.install && result.path) {
      return installPackage(result.path)
    }
  }

  const executor = () =>
    Promise.resolve(loader.execute({ args, env }))
      .then(processResult)

  resolve(executor)
})

module.exports = matchLoader
