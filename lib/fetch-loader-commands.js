var loaderCommands = [
  { name: ':git', description: 'install template from git repository (go :git [host] repo/name [dest]' }
]

module.exports = function fetchLoaderCommands () {
  return loaderCommands
}
