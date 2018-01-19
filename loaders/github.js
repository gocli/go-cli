/*
 * TODO:
 * - validate repository name
 */
var download = require('download-github-repo')

function loadGithubRepository (repository, argv) {
  var destination = argv._[1] || repository.split('/')[1]

  console.log('Loading sources...')

  return new Promise(function (resolve, reject) {
    download(repository, destination, function (err) {
      if (err) reject(err)
      else resolve(destination)
    })
  })
}

module.exports = loadGithubRepository
