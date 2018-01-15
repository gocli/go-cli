var shell = require('shelljs')

function findNextGoBinary () {
  var res = shell.which('-a', 'go')
  if (res.code) return false

  var bins = res.filter(function (bin) { return bin })
  if (bins.length > 1) return bins[1]
  return null
}

module.exports = findNextGoBinary
