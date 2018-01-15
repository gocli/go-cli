#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var exec = require('shelljs').exec

function exit (error) {
  if (error) console.error('Go [error]: ' + error.toString())
  process.exit(1)
}

var goConfigFile = require('../lib/find-goconfig')()
if (!goConfigFile) {
  exit(new ReferenceError('go.config.js file is not found in current and parent folders'))
}

var command = process.argv.slice(2).join(' ')

var entryScript = fs.readFileSync(path.resolve(__dirname, '../scripts/run-goconfig.js'))
  .toString()
  .replace(/%gocli-dir%/g, path.resolve(__dirname, '..'))
  .replace(/%goconfig-file%/g, goConfigFile)
  // TODO: Make sure ' and " works fine after replacing
  .replace(/%command%/g, command)

var shellCommand = 'node -e "' + entryScript + '"'
var exitCode = exec(shellCommand, { cwd: path.dirname(goConfigFile) }).code

if (exitCode) process.exit(exitCode)
