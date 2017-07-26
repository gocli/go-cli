var githubCommand = require('../commands/github')

var core = require('./cli-core')

core.registerCommand(githubCommand)

module.exports = function (args) {
  if (!core.run(args)) {
    console.log('Command is not recognized')
  }
}
