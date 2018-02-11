const log = (message) => console.log('[Go]:', message.toString())
const logError = (message) => console.error('[Go] error:', message.toString())

log.error = logError

export default log
export { log, logError }
