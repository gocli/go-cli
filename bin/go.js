#!/usr/bin/env node

/*
 * TODO:
 * - all commands should be registered with information that will be used to generate HELP output
 * - after loading template the default command should be runned if it is presented
 */

var fs = require('fs')
var path = require('path')
var exec = require('shelljs').exec
var findNextGoBinary = require('../lib/find-next-go-binary')

var ERROR_CODE = 1
var COMMAND_NOT_FOUND_CODE = 44

function triggerError (msg, code) {
  if (!code) code = ERROR_CODE
  console.error('Go [error]:', msg)
  process.exit(ERROR_CODE)
}

var goConfigFile = require('../lib/find-goconfig')()
if (!goConfigFile) {
  return triggerError('go.config.js file is not found in current and parent folders')
}

var argsString = process.argv.slice(2).join(' ')

var entryScript = fs.readFileSync(path.resolve(__dirname, '../scripts/run-goconfig.js'))
  .toString()
  .replace(/%gocli-dir%/g, path.resolve(__dirname, '..'))
  .replace(/%goconfig-file%/g, goConfigFile)
  // TODO: Make sure ' and " works fine after replacing
  .replace(/%command%/g, argsString)

var shellCommand = 'node -e "' + entryScript + '"'
var exitCode = exec(shellCommand, { cwd: path.dirname(goConfigFile) }).code

if (exitCode === COMMAND_NOT_FOUND_CODE) {
  var binary = findNextGoBinary()
  if (!binary) {
    return triggerError('unknown command was triggered: go ' + argsString, exitCode)
  }
  exitCode = exec([binary, argsString].join(' ')).code
  return process.exit(exitCode)
}

if (exitCode) triggerError('excution has failed', exitCode)
