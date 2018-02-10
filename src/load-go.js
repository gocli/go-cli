const loadGo = (env) => {
  if (!loadGo.instance) {
    var go = require(env.modulePath)
    require(env.configPath)
    loadGo.instance = go
  }
  return loadGo.instance
}

export default loadGo
