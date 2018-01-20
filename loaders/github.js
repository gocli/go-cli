var download = require('download-github-repo')

var repositoryRegexp = /^[-\w]+\/[-\w]+$/

function loadGithubRepository (repository, argv) {
  return new Promise(function (resolve, reject) {
    if (!repository) return reject('(github) repository name is required')
    if (!repositoryRegexp.test(repository)) return reject('(github) invalid repository name')

    var destination = argv._[1] || repository.split('/')[1]

    console.log('(github) loading sources...')

    download(repository, destination, function (err) {
      if (err) reject('(github) ' + err.toString())
      else resolve(destination)
    })
  })
}

module.exports = loadGithubRepository
