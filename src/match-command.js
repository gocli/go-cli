import guide from './guide'

const matchCommand = (commandString, argv, env) =>
  new Promise((resolve) => {
    if (!env.configPath || !env.modulePath) {
      return resolve(null)
    }

    const go = require(env.modulePath)
    // initialize local Gofile
    require(env.configPath)

    if (!argv._.length && go.getCommands().length) {
      const executor = () =>
        guide(go.getCommands()).then(go.executeCommand)
      return resolve(executor)
    }

    if (!go.validateCommand(commandString)) {
      return resolve(null)
    }

    resolve(() => go.executeCommand(commandString))
  })

export default matchCommand
