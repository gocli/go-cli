const DEFAULT_ERROR_CODE = 1

class GocliError extends Error {
  constructor (error, code = DEFAULT_ERROR_CODE) {
    const message = error instanceof Error ? error.message : error ? error.toString() : error
    super(message)

    this.name = 'GocliError'
    this.message = message
    this.code = code
  }
}

const fail = (error, code) => new GocliError(error, code)

export default fail
export { GocliError }
