const matchCommand = (commandString, argv, env) =>
  new Promise((resolve) => {
    if (!env.configPath || !env.modulePath) {
      return resolve(null)
    }

    const go = require(env.modulePath)
    // initialize local Gofile
    require(env.configPath)

    if (!go.validateCommand(commandString)) {
      // log('command \'' + argv._[0] + '\' is not matched, falling back to next binary: ')
      return resolve(null)
    }

    const executor = () => go.executeCommand(commandString)

    resolve(executor)
  })

export default matchCommand
