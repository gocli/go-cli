const guide = require('./guide')

const parseCommandNames = command => command.parent
  ? parseCommandNames(command.parent).concat(command.name)
  : [command.name]

const matchCommand = (args, env) => new Promise((resolve) => {
  if (!env.configPath || !env.modulePath) return resolve(null)

  const go = require(env.modulePath)
  // initialize local Gofile
  require(env.configPath)

  const commands = go.cli.getCommands()
  if (!args.length) {
    return resolve(() => {
      const { beforeCallback, firstMessage } = go.cli.getGuideOptions()
      return Promise.resolve(typeof beforeCallback === 'function' && beforeCallback())
        .then(() => guide(commands, firstMessage))
        .then(command => {
          const args = { _: parseCommandNames(command) }
          command.callback({ args })
        })
    })
  }

  if (!commands.length) return resolve(null)

  const commandString = args.join(' ')
  const command = go.cli.matchCommand(commandString)
  if (!command) return resolve(null)

  resolve(() => go.cli.executeCommand(commandString))
})

module.exports = matchCommand
