var path = require('path')
var findup = require('findup-sync')
var CONFIG_FILENAME = 'go.config.js'

module.exports = function findGoConfig (searchDir) {
  searchDir = searchDir || process.cwd()
  return findup(CONFIG_FILENAME, { cwd: searchDir })
}

module.exports.all = function findAllGoConfigs (searchDir) {
  searchDir = searchDir || process.cwd()

  var duplicateFound = false
  var modulesArray = []
  var modulesDir

  do {
    modulesDir = findup(CONFIG_FILENAME, { cwd: searchDir })

    if (modulesDir !== null) {
      var foundModulesDir = modulesDir
      duplicateFound = (modulesArray.indexOf(foundModulesDir) > -1)
      if (!duplicateFound) {
        modulesArray.push(foundModulesDir)
        searchDir = path.join(modulesDir, '../../')
      }
    }
  } while (modulesDir && !duplicateFound)

  return modulesArray
}
