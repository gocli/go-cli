#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn
var Liftoff = require('liftoff')
var minimist = require('minimist')
var interpret = require('interpret')

var OK = 0
var ERROR = 1
var CONFIG_FILE = '.goconfig'
var DEFAULT_LOADER = 'github'

var args = process.argv.slice(2)
var argv = minimist(args, {
  default: { install: true }
})

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
  if (!argv._[0]) exit('Help is not ready yet', ERROR)

  if (isInnerCommand(argv)) {
    return executeInnerCommand(argv)
  }

  if (!env.modulePath) exit('go package is not installed', ERROR)
  if (!env.configPath) exit('Gofile is not found', ERROR)

  executeLocalCommand(env.modulePath, env.configPath, argv)
}

function isInnerCommand (argv) {
  return argv._[0] && argv._[0].indexOf(':') === 0
}

function executeInnerCommand (argv) {
  var command = argv._[0].match(/^:([\w]+)?(:(.*))?$/)
  var loaderName = command[1]
  var source = command[3]
  var loader = getLoader(loaderName)

  if (!loader) exit(loaderName + ' loader is not registered', ERROR)

  return loader(source, argv)
    .then(function (destination) {
      function finish () {
        exit('project is deployed to the directory \`' + destination + '\`')
      }

      if (!argv.install) finish()
      else installTemplate(destination)
        .then(finish)
        .catch(function (error) { exit(error, ERROR) })
    })
    .catch(function(error) { exit(error, ERROR) })
}

function getLoader (name) {
  if (!name) name = DEFAULT_LOADER
  try {
    return require('../loaders/' + name)
  } catch (err) {
    return null
  }
}

function installTemplate (destination) {
  return new Promise(function (resolve, reject) {
    var configPath = destination + '/' + CONFIG_FILE

    try { fs.statSync(configPath) }
    catch (o_O) { resolve(CONFIG_FILE + ' not found') }

    try {
      var config = require(configPath)
      if (!config) return resolve()

      if (config.install) {
        spawn(config.install, { stdio: 'inherit', shell: true, cwd: destination })
          .on('error', reject)
          .on('exit', function (code) {
            if (code) reject('install command has failed')
            else resolve()
          })
      }
    } catch (err) {
      reject(err)
    }
  })
}

function executeLocalCommand (modulePath, configPath, argv) {
  var go = require(modulePath)
  go.use(require('../plugin'))
  require(configPath)
  go.executeCommand(argv._.join(' '))
    .then(function (result) {
      if (result) exit(result)
    })
    .catch(function (error) {
      exit(error, ERROR)
    })
}

function exit (message, code) {
  if (typeof code === 'undefined') code = OK
  if (message) {
    if (code === OK) console.log('[Go]:', message)
    else console.error('[Go] error:', message)
  }
  process.exit(code)
}
