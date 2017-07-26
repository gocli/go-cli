var commands = []
var noop = function(){}

module.exports = {
  run: function (args, cb) {
    for (var i = 0; i < commands.length; i++) {
      if (commands[i].test(args)) {
        commands[i].exec(args, cb || noop)
        return true
      }
    }
    return false
  },
  registerCommand: function (command) {
    commands.push(command)
  }
}
