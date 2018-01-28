var minimist = require('minimist')

function normalizeCommand (command) {
  if (typeof command == 'string') return '^' + command + '$'
  if (command instanceof RegExp) return command.toString().slice(1, -1)

  return false
}

function showWarning (msg) {
  console.log('[Go] warning:', msg)
}

function installPlugin (proto) {
  var commands = {}

  proto.validateCommand = function validateCommand (commandRequest) {
    if (typeof commandRequest !== 'string') {
      throw new TypeError('`commandRequest` should be a string')
    }

    return !!matchCommand(commandRequest)
  }

  proto.executeCommand = function executeCommand (commandRequest) {
    if (typeof commandRequest !== 'string') {
      throw new TypeError('`commandRequest` should be a string')
    }

    var argv = parseCommand(commandRequest)
    var command = matchCommand(commandRequest)

    if (!command) {
      return Promise.reject('command \'' + argv._[0] + '\' is not registered')
    }

    return Promise.resolve(command.callback.call(proto, argv, command.options))
  }

  proto.registerCommand = function registerCommand (selector, optionsOrCallback, callbackOrNothing) {
    var name = typeof selector === 'string' ? selector : null
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

    commands[selector] = {
      options: options,
      callback: callback,
      selector: selector,
      name: name
    }

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

  proto.listCommands = function listCommands () {
    var keys = Object.keys(commands)
    var result = []
    for (var i = 0; i < keys.length; i++) {
      if (commands[keys[i]].name) {
        result.push({
          name: commands[keys[i]].name,
          description: commands[keys[i]].options.description || ''
        })
      }
    }
    return result
  }

  function matchCommand (commandRequest) {
    var argv = parseCommand(commandRequest)
    var triggeredCommand = argv._[0]
    var tests = Object.keys(commands)
    var index = tests.length
    while (index--) {
      var selector = new RegExp(tests[index])
      if (selector.test(triggeredCommand)) break
    }

    if (!~index) return null

    var commandIndex = tests[index]
    var command = commands[commandIndex]

    return command
  }

  function parseCommand (commandRequest) {
    return minimist(commandRequest.trim().split(/\s+/g))
  }
}

module.exports = { install: installPlugin }
