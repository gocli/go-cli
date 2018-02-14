const log = (message) => console.log('[Go]:', message)
const logError = (error) => {
  if (error instanceof Error) {
    error = error.stack || error.message
  }
  if (error) console.error('[Go] error:', error)
}

log.error = logError

export default log
export { log, logError }
