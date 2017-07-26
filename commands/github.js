var download = require('download-github-repo')

module.exports = {
  test: function (args) {
    return !!(args[0] || '').match(/^[-_a-zA-Z\d]+\/[-_a-zA-Z\d]+/)
  },
  exec: function (args, cb) {
    var repo = args[0]
    var dest = args[1] || args[0].split('/')[1]

    console.log('Loading sources...')
    download(repo, dest, function(err) {
      if (err) {
        console.log('Can not download repo (' + repo + '): ' + err)
      } else {
        console.log('Code is ready! Check it in the "' + dest + '" directory')
      }
    })
  }
}
