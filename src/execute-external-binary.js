import { spawn } from 'child_process'
import exit, { ERROR } from './exit'
import getExternalBinary from './get-external-binary'

const executeExternalBinary = (command) => {
  const bin = getExternalBinary()
  spawn(bin + ' ' + command, { stdio: 'inherit', shell: true })
    .on('error', function (error) {
      exit(error, ERROR)
    })
    .on('exit', function (code) {
      exit(null, code)
    })
}

export default executeExternalBinary
