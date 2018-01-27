var normalizePath = require('path').normalize
var resolvePath = require('path').resolve
var sep = require('path').sep
var rimraf = require('rimraf')
var download = require('download-github-repo')
var generate = require('vue-cli/lib/generate')

function loadVueRepository (repository, argv) {
  return new Promise(function (resolve, reject) {
    if (!repository) return reject('(vue) repository name is required')

    if (!~repository.indexOf('/')) {
      // use official templates
      repository = 'vuejs-templates/' + repository
    }

    var destination = normalizePath(argv._[1] || repository.split('/')[1])
    var tmp = destination + '-goloader-tmp'

    console.log('(vue) loading sources...')

    download(repository, tmp, function (err) {
      if (err) return reject('(vue) ' + err.toString())

      var destSlash = destination.lastIndexOf(sep)
      var name = !~destSlash ? destination : destination.slice(destSlash + 1)

      generate(name, resolvePath(tmp), resolvePath(destination), function (err) {
        rimraf(resolvePath(tmp), () => {
          if (err) return reject('(vue) ' + err.toString())
          resolve(destination)
        })
      })
    })
  })
}

module.exports = loadVueRepository
