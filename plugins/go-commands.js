var yargs = require('yargs')

function normalizeCommand (command) {
  if (typeof command == 'string') return command
  if (command instanceof RegExp) return command.toString().slice(1, -1)

  return false
}

function showWarning (msg) {
  console.log('Go [warn]:', msg)
}

function installPlugin (proto) {
  var commands = {}

  proto.executeCommand = function executeCommand (commandRequest) {
    if (typeof commandRequest !== 'string') {
      throw new TypeError('`commandRequest` should be a string')
    }

    var args = yargs(commandRequest.trim().split(/\s+/g)).argv
    var triggeredCommand = args._[0]
    var tests = Object.keys(commands)
    var index = tests.length
    while (index--) {
      var selector = new RegExp(tests[index])
      if (selector.test(triggeredCommand)) break
    }

    if (!~index) {
      var error = triggeredCommand
        ? 'command `' + triggeredCommand + '` is not registered'
        : 'default command is not registered'
      return Promise.reject(new ReferenceError(error))
    }

    var commandIndex = tests[index]
    var command = commands[commandIndex]

    return Promise.resolve(command.callback.call(proto, args, command.options))
  }

  proto.registerCommand = function registerCommand (selector, optionsOrCallback, callbackOrNothing) {
    selector = normalizeCommand(selector)

    if (!selector) {
      throw new TypeError('`selector` should be either a string or regexp')
    }

    var callback, options

    if (typeof optionsOrCallback === 'function') {
      callback = optionsOrCallback
    } else if (typeof optionsOrCallback === 'object') {
      options = optionsOrCallback
      if (typeof callbackOrNothing === 'function') {
        callback = callbackOrNothing
      }
    }

    if (commands.hasOwnProperty(selector)) {
      showWarning('Rewriting exisiting command (' + selector + ')')
    }

    commands[selector] = { options: options, callback: callback, selector: selector }

    return proto
  }

  proto.unregisterCommand = function unregisterCommand (selector) {
    selector = normalizeCommand(selector)

    if (!selector) {
      throw new TypeError('`selector` should be either a string or regexp')
    }

    if (commands.hasOwnProperty(selector)) {
      delete commands[selector]
    } else {
      showWarning('Trying to unregister not registered command (' + selector + ')')
    }

    return proto
  }
}

module.exports = { install: installPlugin }
