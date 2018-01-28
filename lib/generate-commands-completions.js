module.exports = function generateCommandsCompletions (commands) {
  var commandsNames = []
  for (var i = 0; i < commands.length; i++) {
    commandsNames.push(commands[i].name)
  }
  return commandsNames.join('\n')
}
