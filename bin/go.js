#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn
var Liftoff = require('liftoff')
var minimist = require('minimist')
var interpret = require('interpret')
var which = require('which')
var resolvePath = require('path').resolve
var joinPath = require('path').join
var requireLoader = require('../lib/require-loader')

var OK = 0
var ERROR = 1
var CONFIG_FILE = '.goconfig'

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
  if (isInnerCommand(argv)) {
    return executeInnerCommand(argv)
  }

  var command = args.join(' ')
  if (env.configPath) {
    if (!env.modulePath) {
      if (getExternalBinary()) {
        log('go package is not installed, falling back to next binary: ' + getExternalBinary())
        executeExternalBinary(command)
      } else {
        exit('go package is not installed', ERROR)
      }
    } else {
      var go = loadGo(env)
      if (!go.validateCommand(command) && getExternalBinary()) {
        log('command \'' + argv._[0] + '\' is not matched, falling back to next binary: ' + getExternalBinary())
        executeExternalBinary(command)
      } else {
        executeLocalCommand(command, env)
      }
    }
  } else {
    if (getExternalBinary()) {
      executeExternalBinary(command)
    } else {
      exit('Gofile is not found', ERROR)
    }
  }
}

function isInnerCommand (argv) {
  return argv._[0] && argv._[0].indexOf(':') === 0
}

function executeInnerCommand (argv) {
  var command = argv._[0].match(/^:([\w]+)?(:(.*))?$/)
  var loaderName = command[1]
  var prefix = command[3]

  try {
    var loader = requireLoader(loaderName)
  } catch (error) {
    exit(error, ERROR)
  }

  if (!loader) {
    var message = loaderName + ' loader is missing.\n'
      + 'Try to install it:\n'
      + ' $ npm i -g ' + requireLoader.normalizeName(loaderName)
    exit(message, ERROR)
  }

  if (typeof loader !== 'function' && typeof loader.execute !== 'function') {
    exit(requireLoader.normalizeName(loaderName) + ' is not compatible')
  }

  return (loader.execute || loader)(argv, prefix)
    .then(function (result) {
      var path = result && result.path
      if (!path) exit()

      function finish () {
        if (!path) exit()
        exit('project is deployed to the directory \`' + path + '\`')
      }

      if (!argv.install) finish()
      else installTemplate(path)
        .then(finish)
        .catch(function (error) { exit(error, ERROR) })
    })
    .catch(function(error) { exit(error, ERROR) })
}

function installTemplate (path) {
  return new Promise(function (resolve, reject) {
    var configPath = resolvePath('.', path, CONFIG_FILE)

    try { fs.statSync(configPath) }
    catch (o_O) { resolve() }

    var config = require(configPath)
    if (!config) return resolve()

    if (config.install) {
      spawn(config.install, { stdio: 'inherit', shell: true, cwd: path })
        .on('error', reject)
        .on('exit', function (code) {
          if (code) reject('install command has failed')
          else resolve()
        })
    }
  })
}

function executeLocalCommand (command, env) {
  var go = loadGo(env)
  go.executeCommand(command)
    .then(function (result) {
      if (result) exit(result)
    })
    .catch(function (error) {
      exit(error, ERROR)
    })
}

function loadGo (env) {
  if (!loadGo.instance) {
    var go = require(env.modulePath)
    go.use(require(joinPath('..', 'plugin')))
    require(env.configPath)
    loadGo.instance = go
  }
  return loadGo.instance
}

function getExternalBinary () {
  if (!getExternalBinary.instance) {
    var goBinaries = which.sync('go', { all: true })
    getExternalBinary.instance = goBinaries[1] || null
  }
  return getExternalBinary.instance
}

function executeExternalBinary (command) {
  var bin = getExternalBinary()
  spawn(bin + ' ' + command, { stdio: 'inherit', shell: true })
    .on('error', function (error) {
      exit(error, ERROR)
    })
    .on('exit', function (code) {
      exit(null, code)
    })
}

function log (message) {
  console.log('[Go]:', message)
}

function logError (message) {
  console.error('[Go] error:', message)
}

function exit (message, code) {
  if (typeof code === 'undefined') code = OK
  if (message) {
    if (code === OK) log(message)
    else logError(message)
  }
  process.exit(code)
}
