const guide = require('./guide')

const matchCommand = (args, env) => new Promise((resolve) => {
  if (!env.configPath || !env.modulePath) return resolve(null)

  const go = require(env.modulePath)
  // initialize local Gofile
  require(env.configPath)

  if (!args.length) {
    return resolve(() => guide(go.getCommands()).then(go.executeCommand))
  }

  if (!go.getCommands().length) return resolve(null)

  const command = go.matchCommand(args.join(' '))
  if (!command) return resolve(null)

  resolve(() => go.executeCommand(command))
})

module.exports = matchCommand
