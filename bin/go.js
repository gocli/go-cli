#!/usr/bin/env node

/*
 * TODO:
 * - all commands should be registered with information that will be used to generate HELP output
 * - after loading template the default command should be runned if it is presented (using .goconfig file)
 * - add help output
 * - add completions
 */

var fs = require('fs')
var Liftoff = require('liftoff')
var minimist = require('minimist')
var interpret = require('interpret')

var OK = 0
var ERROR = 1

var args = process.argv.slice(2)
var argv = minimist(args)

var Cli = new Liftoff({
  name: 'go',
  processTitle: ['go'].concat(args).join(' '),
  extensions: interpret.jsVariants
})

Cli.launch({
  cwd: argv.cwd,
  configPath: argv.myappfile,
  require: argv.require,
  completion: argv.completion
}, execute)

function execute (env) {
  if (!args[0]) exit('Help is not ready yet', ERROR)

  if (args[0] && args[0].indexOf(':') === 0) {
    var command = args[0].match(/^:([\w]+)(:(.*))?$/)
    var loaderName = command[1]
    var source = command[3]
    var loader = getLoader(loaderName)
    if (loader) {
      loader(source, argv)
        .then(function (destination) {
          exit('project is deployed to the directory \`' + destination + '\`')
        })
        .catch(function(error) {
          exit(error, ERROR)
        })
    } else {
      exit(loaderName + ' loader is not registered', ERROR)
    }
    return
  }

  if (!env.modulePath) exit('go package is not installed', ERROR)
  if (!env.configPath) exit('Gofile is not found', ERROR)

  var go = require(env.modulePath)
  go.use(require('../plugin'))
  require(env.configPath)
  go.executeCommand(args.join(' '))
    .then(function (result) {
      if (result) exit(result)
    })
    .catch(function (error) {
      exit(error, ERROR)
    })
}

function getLoader (name) {
  try {
    return require('../loaders/' + name)
  } catch (err) {
    return null
  }
}

function exit (message, code) {
  if (typeof code === 'undefined') code = OK
  if (message) {
    if (code === OK) console.log('[Go]:', message)
    else console.error('[Go] error:', message)
  }
  process.exit(code)
}
