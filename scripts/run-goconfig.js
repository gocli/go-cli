var go = require('go')
  .use(require('%gocli-dir%/plugins/go-commands'))
  .use(require('%gocli-dir%/plugins/github'))

require('%goconfig-file%')

go.executeCommand('%command%')
  .then(result => {
    if (typeof result !== 'undefined') console.log(result)
  })
  .catch(error => {
    console.error('Go [error]: ' + error.toString())
    process.exit(1)
  })
