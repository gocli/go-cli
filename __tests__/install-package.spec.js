const mockStatSync = jest.fn()
jest.mock('fs', () => ({ statSync: mockStatSync }))
const mockSpawn = jest.fn()
jest.mock('child_process', () => ({ spawn: mockSpawn }))

const { resolve } = require('path')
const EventEmitter = require('events')
const installPackage = require('../lib/install-package')

describe('Install package', () => {
  beforeEach(() => {
    mockStatSync.mockReset()
    mockSpawn.mockReset()
  })

  it('skips not existing config', () => {
    mockStatSync.mockImplementation(() => { throw new Error('failed') })

    return installPackage('./not-existing')
      .then((res) => {
        expect(res).toBe('skip installation: .goconfig(.json) file is not found')
        expect(mockStatSync).toHaveBeenCalledTimes(2)
        expect(mockStatSync).toHaveBeenCalledWith(resolve('./not-existing/.goconfig'))
        expect(mockStatSync).toHaveBeenCalledWith(resolve('./not-existing/.goconfig.json'))
      })
  })

  it('skips config without install script', () => {
    const path = './__tests__/data/install-package-json'
    return expect(installPackage(path)).resolves.toBe(undefined)
  })

  it('runs the script from js file', () => {
    const path = './__tests__/data/install-package-js-install'
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)

    setTimeout(() => ee.emit('exit', 0))
    return installPackage(path)
      .then(res => {
        expect(res).toBe(undefined)
        expect(mockSpawn).toHaveBeenCalledWith('js-script', {
          stdio: 'inherit',
          shell: true,
          cwd: path
        })
      })
  })

  it('runs the script from json file', () => {
    const path = './__tests__/data/install-package-json-install'
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)

    setTimeout(() => ee.emit('exit', 0))
    return installPackage(path)
      .then(res => {
        expect(res).toBe(undefined)
        expect(mockSpawn).toHaveBeenCalledWith('json-script', {
          stdio: 'inherit',
          shell: true,
          cwd: path
        })
      })
  })

  it('rejects if spawned script exit code is not 0', () => {
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)

    setTimeout(() => ee.emit('exit', 42))
    return expect(installPackage('./__tests__/data/install-package-js-install'))
      .rejects.toThrow('install command has failed')
  })

  it('rejects if spawned script emits error', () => {
    const ee = new EventEmitter()
    mockSpawn.mockReturnValue(ee)

    setTimeout(() => ee.emit('error', 'fail'))
    return expect(installPackage('./__tests__/data/install-package-json-install'))
      .rejects.toThrow('fail')
  })
})
