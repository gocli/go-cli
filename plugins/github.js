var download = require('download-github-repo')

var repositoryRegexp = '[-\\w]+\\/[-\\w]+'
var folderRegexp = '[-\\.\\/\\w]*'
var githubCommandRegexp = new RegExp('^\\s*' + repositoryRegexp + '\\s*' + folderRegexp + '\\s*$')

function registerGithubCommand (proto) {
  proto.registerCommand(githubCommandRegexp, function loadGithubRepository (args) {
    var repo = args._[0]
    var dest = args._[1] || args._[0].split('/')[1]

    console.log('Loading sources...')
    download(repo, dest, function (err) {
      if (err) {
        console.log('Can not download repo (' + repo + '): ' + err)
      } else {
        console.log('Code is ready! Check it in the "' + dest + '" directory')
      }
    })
  })
}

module.exports = { install: registerGithubCommand }
