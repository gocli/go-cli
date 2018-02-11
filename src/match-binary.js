import which from 'which'
import { spawn } from 'child_process'
import fail from './fail'

const getExternalBinary = () =>
  (which.sync('go', { all: true }) || [])[1]

const matchBinary = (commandString) =>
  new Promise((resolve, reject) => {
    const bin = getExternalBinary()
    if (!bin) return resolve(null)

    const executor = () =>
      new Promise((resolve, reject) => {
        spawn(`${bin} ${commandString}`, { stdio: 'inherit', shell: true })
          .on('error', (error) => reject(error))
          .on('exit', (code) => {
            if (code) reject(fail(null, code))
            else resolve()
          })
      })

    resolve(executor)
  })

export default matchBinary
