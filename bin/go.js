#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn
var Liftoff = require('liftoff')
var minimist = require('minimist')
var interpret = require('interpret')
var which = require('shelljs').which
var sep = require('path').sep
var pathResolve = require('path').resolve

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
    return require('..' + sep + 'loaders' + sep + name)
  } catch (err) {
    return null
  }
}

function installTemplate (destination) {
  return new Promise(function (resolve, reject) {
    var configPath = pathResolve('.' + sep + destination + sep + CONFIG_FILE)

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
    go.use(require('..' + sep + 'plugin'))
    require(env.configPath)
    loadGo.instance = go
  }
  return loadGo.instance
}

function getExternalBinary () {
  if (!getExternalBinary.instance) {
    var goBinaries = which('-a', 'go')
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
