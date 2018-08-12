const mockWhichSync = jest.fn()
jest.mock('which', () => ({ sync: mockWhichSync }))
const mockSpawn = jest.fn()
jest.mock('child_process', () => ({ spawn: mockSpawn }))

const EventEmitter = require('events')
const matchBinary = require('../lib/match-binary')

describe('Match Binary', () => {
  const args = ['the', 'command']
  const jsBin = '/bin/node/go'
  const goBin = '/bin/go'
  const processArgv = process.argv

  beforeEach(() => {
    mockWhichSync.mockReset()
    mockWhichSync.mockReturnValue([jsBin, goBin])

    mockSpawn.mockReset()

    process.argv = ['/bin/node', jsBin]
  })

  afterEach(() => {
    process.argv = processArgv
  })

  it('calls which.sync with flag all set to true', () => {
    return matchBinary(args)
      .then((executor) => {
        expect(mockWhichSync).toHaveBeenCalledWith('go', { all: true })
      })
  })

  it('resolves with null if extra binary not found', () => {
    mockWhichSync.mockReturnValue(undefined)
    return expect(matchBinary(args)).resolves.toBe(null)
  })

  it('resolves with null if which returns no binaries', () => {
    mockWhichSync.mockReturnValue([jsBin])
    return expect(matchBinary(args)).resolves.toBe(null)
  })

  it('resolves with binary if it is different from the runned one', () => {
    const ee = new EventEmitter()
    mockWhichSync.mockReturnValue([goBin])
    mockSpawn.mockReturnValue(ee)
    setTimeout(() => ee.emit('exit', 0))
    return matchBinary(args)
      .then((executor) => executor())
      .then(() => {
        expect(mockSpawn).toHaveBeenCalledTimes(1)
        expect(mockSpawn).toHaveBeenCalledWith(`${goBin} the command`, {
          stdio: 'inherit',
          shell: true
        })
      })
  })

  it('resolves with executor function if extra binary is found', () => {
    return matchBinary(args)
      .then((executor) => {
        expect(typeof executor).toBe('function')
      })
  })

  it('spawns the process with extra binary', () => {
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)
    setTimeout(() => ee.emit('exit', 0))
    return matchBinary(args)
      .then((executor) => executor())
      .then(() => {
        expect(mockSpawn).toHaveBeenCalledTimes(1)
        expect(mockSpawn).toHaveBeenCalledWith(`${goBin} the command`, {
          stdio: 'inherit',
          shell: true
        })
      })
  })

  it('resolves if process exit with code 0', () => {
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)
    setTimeout(() => ee.emit('exit', 0))
    return matchBinary(args)
      .then((executor) => expect(executor()).resolves.toBe(undefined))
  })

  it('rejects if process exit with code different from 0', () => {
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)
    setTimeout(() => ee.emit('exit', 1))
    return matchBinary(args)
      .then((executor) => expect(executor()).rejects.toThrow())
  })

  it('rejects if process sends the error', () => {
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)
    setTimeout(() => ee.emit('error', 'fail'))
    return matchBinary(args)
      .then((executor) => expect(executor()).rejects.toThrow('fail'))
  })
})
