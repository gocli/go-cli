import gocli from './gocli'
import { log, logError } from './log'
import { STATUS_OK, STATUS_ERROR } from './process-statuses'

const args = process.argv.slice(2)
gocli(args)
  .then((message) => {
    log(message)
    process.exit(STATUS_OK)
  })
  .catch((error) => {
    logError(error)
    process.exit(error.code || STATUS_ERROR)
  })
