import fs from 'fs'
import { resolve as resolvePath } from 'path'
import { spawn } from 'child_process'
import fail from './fail'

const CONFIG_FILE = '.goconfig'

const installTemplate = (path) =>
  new Promise((resolve, reject) => {
    const configPath = resolvePath('.', path, CONFIG_FILE)

    try {
      fs.statSync(configPath)
    } catch (oO) {
      try {
        fs.statSync(configPath + '.json')
      } catch (oO) {
        return resolve(CONFIG_FILE + '(.json) not found')
      }
    }

    const config = require(configPath)
    if (!config || !config.install) return resolve()

    spawn(config.install, { stdio: 'inherit', shell: true, cwd: path })
      .on('error', reject)
      .on('exit', (code) => {
        if (code) reject(fail('install command has failed', code))
        else resolve()
      })
  })

export default installTemplate
