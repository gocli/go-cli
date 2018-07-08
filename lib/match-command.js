const guide = require('./guide')

const matchCommand = (args, env) => new Promise((resolve) => {
  if (!env.configPath || !env.modulePath) return resolve(null)

  const go = require(env.modulePath)
  // initialize local Gofile
  require(env.configPath)

  if (!args.length) {
    return resolve(() => guide(go.getCommands()).then(command => command.callback()))
  }

  if (!go.getCommands().length) return resolve(null)

  const commandRequest = args.join(' ')
  const command = go.matchCommand(commandRequest)
  if (!command) return resolve(null)

  resolve(() => go.executeCommand(commandRequest))
})

module.exports = matchCommand
