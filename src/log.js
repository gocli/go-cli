const log = (message) => console.log('[Go]:', message)
const logError = (message) => console.error('[Go] error:', message)

log.error = logError

export default log
export { log, logError }
