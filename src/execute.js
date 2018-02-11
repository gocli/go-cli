import minimist from 'minimist'
import fail from './fail'
import matchCommand from './match-command'
import matchLoader from './match-loader'
import matchBinary from './match-binary'

const findExecutor = (matchers, commandString, argv, env) => {
  if (!matchers.length) return Promise.resolve(null)
  return matchers[0](commandString, argv, env)
    .then((executor) => {
      if (executor) return executor
      return findExecutor(matchers.slice(1), commandString, argv, env)
    })
}

const execute = (args, env) => {
  return new Promise((resolve, reject) => {
    const argv = minimist(args)
    const commandString = args.join(' ')

    const matchers = [
      matchCommand,
      matchLoader,
      matchBinary
    ]

    findExecutor(matchers, commandString, argv, env)
      .then((executor) => {
        if (executor) return resolve(executor())
        throw fail('Command is not recognized')
      })
      .catch(reject)
  })
}

export default execute
