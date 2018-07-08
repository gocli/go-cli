const which = require('which')
const { spawn } = require('child_process')

const getExternalBinary = () => {
  const binaries = which.sync('go', { all: true })
  if (Array.isArray(binaries) && binaries.length > 1) {
    return binaries[1]
  }
}

const matchBinary = (args) => new Promise((resolve) => {
  const bin = getExternalBinary()
  if (!bin) return resolve(null)

  const executor = () => new Promise((resolve, reject) => {
    spawn(`${bin} ${args.join(' ')}`, { stdio: 'inherit', shell: true })
      .on('error', reject)
      .on('exit', (code) => {
        if (code) {
          const error = new Error()
          error.code = code
          return reject(error)
        }
        resolve()
      })
  })

  resolve(executor)
})

module.exports = matchBinary
