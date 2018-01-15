var ERROR_CODE = 1
var COMMAND_NOT_FOUND_CODE = 44

var go = require('go')
  .use(require('%gocli-dir%/plugins/go-commands'))
  .use(require('%gocli-dir%/plugins/github'))

require('%goconfig-file%')

go.executeCommand('%command%')
  .then(result => {
    if (typeof result !== 'undefined') console.log(result)
  })
  .catch(error => {
    var exitCode = error instanceof ReferenceError ? COMMAND_NOT_FOUND_CODE : ERROR_CODE
    process.exit(exitCode)
  })
