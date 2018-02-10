import exit, { ERROR } from './exit'
import loadGo from './load-go'

const executeLocalCommand = (command, env) => {
  var go = loadGo(env)
  go.executeCommand(command)
    .then(function (result) {
      if (result) exit(result)
    })
    .catch(function (error) {
      exit(error, ERROR)
    })
}

export default executeLocalCommand
