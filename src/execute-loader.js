import requireLoader from './require-loader'
import installTemplate from './install-template'
import exit, { ERROR } from './exit'

const executeLoader = (argv) => {
  var command = argv._[0].match(/^:([\w]+)?(:(.*))?$/)
  var loaderName = command[1]
  var prefix = command[3]

  try {
    var loader = requireLoader(loaderName)
  } catch (error) {
    exit(error, ERROR)
  }

  if (!loader) {
    var message = loaderName + ' loader is missing.\n' +
      'Try to install it:\n' +
      ' $ npm i -g ' + requireLoader.normalizeName(loaderName)
    exit(message, ERROR)
  }

  if (typeof loader !== 'function' && typeof loader.execute !== 'function') {
    exit(requireLoader.normalizeName(loaderName) + ' is not compatible')
  }

  return (loader.execute || loader)(argv, prefix)
    .then(function (result) {
      var path = result && result.path
      if (!path) exit()

      function finish (message) {
        if (message) console.log('(git) ' + message)
        if (!path) exit()
        exit('project is deployed to the directory `' + path + '`')
      }

      if (argv.install === false) {
        finish()
      } else {
        installTemplate(path)
          .then(finish)
          .catch(function (error) { exit(error, ERROR) })
      }
    })
    .catch(function (error) { exit(error, ERROR) })
}

export default executeLoader
