import minimist from 'minimist'
import log from './log'
import exit, { ERROR } from './exit'
import executeLoader from './execute-loader'
import matchLoader from './match-loader'
import getExternalBinary from './get-external-binary'
import executeLocalCommand from './execute-local-command'
import executeExternalBinary from './execute-external-binary'
import loadGo from './load-go'

const execute = (args, env) => {
  const argv = minimist(args)

  if (matchLoader(argv)) {
    return executeLoader(argv)
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

export default execute
