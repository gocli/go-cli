import fs from 'fs'
import { resolve as resolvePath } from 'path'
import { spawn } from 'child_process'

const CONFIG_FILE = '.goconfig'

const installTemplate = (path) => {
  return new Promise(function (resolve, reject) {
    var configPath = resolvePath('.', path, CONFIG_FILE)

    try {
      fs.statSync(configPath)
    } catch (oO) {
      try {
        fs.statSync(configPath + '.json')
      } catch (oO) { return resolve(CONFIG_FILE + '(.json) not found') }
    }

    var config = require(configPath)
    if (!config || !config.install) return resolve()

    spawn(config.install, { stdio: 'inherit', shell: true, cwd: path })
      .on('error', reject)
      .on('exit', function (code) {
        if (code) reject('install command has failed')
        else resolve()
      })
  })
}

export default installTemplate
