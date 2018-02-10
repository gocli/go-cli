import log from './log'
import logError from './log-error'

const OK = 0
const ERROR = 1

const exit = (message, code) => {
  if (typeof code === 'undefined') {
    code = OK
  }

  if (message) {
    if (code === OK) {
      log(message)
    } else {
      logError(message)
    }
  }

  process.exit(code)
}

export default exit
export { OK, ERROR }
