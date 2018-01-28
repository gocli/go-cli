var fs = require('fs')
var joinPath = require('path').join

function fail (error) {
  console.error('echo "[Go] error: ' + error + '"')
  process.exit(1)
}

module.exports = function (type) {
  if (typeof type !== 'string') fail('missing completion type')

  var file = joinPath(__dirname, '../completion', type)
  try {
    console.log(fs.readFileSync(file, 'utf8'))
    process.exit(0)
  } catch (err) {
    fail('autocompletion rules for \'' + type + '\' not found')
  }
}
