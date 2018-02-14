import installTemplate from './install-template'
import requireLoader, { normalizeName } from './require-loader'
import isFunction from './is-function'
import fail from './fail'
import isGitUrl from 'is-git-url'

const SEP = ':'
const GIT_LOADER_NAME = 'git'

const normalizeArgv = (argv) => {
  if (!argv._.length) return argv

  const command = argv._[0]

  if (isGitUrl(command)) {
    return { ...argv, _: [GIT_LOADER_NAME].concat(argv._) }
  }

  const sepIndex = command.indexOf(SEP)
  const parts = ~sepIndex
    ? [ command.slice(0, sepIndex), command.slice(sepIndex + 1) ]
    : [ command ]

  return {
    ...argv,
    _: parts.concat(argv._.slice(1))
  }
}

const matchLoader = (commandString, argv) =>
  new Promise((resolve, reject) => {
    argv = normalizeArgv(argv)

    const loaderName = argv._[0]
    if (!loaderName) return resolve(null)

    const loader = requireLoader(loaderName)
    if (!loader) return resolve(null)

    if (!isFunction(loader) && !isFunction(loader.execute)) {
      return reject(fail(`${normalizeName(loaderName)} is not compatible`))
    }

    const loaderExecutor = loader.execute || loader

    const executor = () =>
      Promise.resolve(loaderExecutor(commandString, argv))
        .then((result) => {
          const path = result && result.path
          if (!path || argv.install === false) return
          return installTemplate(path)
        })

    resolve(executor)
  })

export default matchLoader
