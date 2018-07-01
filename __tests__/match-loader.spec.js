const mockUtils = {
  normalizeLoaderName: jest.fn(),
  requireLoader: jest.fn()
}
jest.mock('../lib/utils', () => mockUtils)
const mockInstallPackage = jest.fn()
jest.mock('../lib/install-package', () => mockInstallPackage)

const matchLoader = require('../lib/match-loader')

describe('Match Loader', () => {
  const args = ['the', 'command']
  const genEnv = () => ({ check: Math.random() })
  const mockLoader = { execute: jest.fn() }
  const loaderName = 'go-loader-name'

  beforeEach(() => {
    mockLoader.execute.mockReset()

    mockUtils.normalizeLoaderName.mockReset()
    mockUtils.normalizeLoaderName.mockReturnValue(loaderName)
    mockUtils.requireLoader.mockReset()
    mockUtils.requireLoader.mockReturnValue(mockLoader)

    mockInstallPackage.mockReset()
    mockInstallPackage.mockResolvedValue(null)
  })

  it('resolves with null if command is empty', () => {
    mockUtils.normalizeLoaderName.mockReturnValue(null)
    return matchLoader([], genEnv())
      .then((loader) => {
        expect(loader).toBe(null)
        expect(mockUtils.normalizeLoaderName).toHaveBeenCalledWith(undefined)
      })
  })

  it('resolves with null if loader is not found', () => {
    mockUtils.requireLoader.mockReturnValue(null)
    return matchLoader(args, genEnv())
      .then((loader) => {
        expect(loader).toBe(null)
        expect(mockUtils.requireLoader).toHaveBeenCalledWith(loaderName)
      })
  })

  it('rejects if loader does not have execute method', () => {
    mockUtils.requireLoader.mockReturnValue({})
    return expect(matchLoader(args, genEnv()))
      .rejects.toThrow('go-loader-name should export \'execute\' method')
  })

  it('resolves with the executor', () => {
    const env = genEnv()
    return matchLoader(args, env)
      .then((executor) => {
        expect(typeof executor).toBe('function')
        return executor()
      })
      .then(() => {
        expect(mockLoader.execute).toHaveBeenCalledTimes(1)
        expect(mockLoader.execute).toHaveBeenCalledWith({ args, env })
      })
  })

  it('installs package if install property is truthy and path is given', () => {
    const path = '.'
    mockLoader.execute.mockReturnValue({ install: true, path })
    return matchLoader(args, genEnv())
      .then((executor) => executor())
      .then(() => {
        expect(mockInstallPackage).toHaveBeenCalledTimes(1)
        expect(mockInstallPackage).toHaveBeenCalledWith(path)
      })
  })

  it('does not install package if install is falsy', () => {
    const path = '.'
    mockLoader.execute.mockReturnValue({ install: false, path })
    return matchLoader(args, genEnv())
      .then((executor) => executor())
      .then(() => {
        expect(mockInstallPackage).not.toHaveBeenCalled()
      })
  })

  it('does not install package if path property is not given', () => {
    mockLoader.execute.mockReturnValue({ install: true })
    return matchLoader(args, genEnv())
      .then((executor) => executor())
      .then(() => {
        expect(mockInstallPackage).not.toHaveBeenCalled()
      })
  })

  it('rejects if loader execution fails', () => {
    mockLoader.execute.mockImplementation(() => { throw new Error('loader fails') })
    return matchLoader(args, genEnv())
      .then((executor) => expect(executor()).rejects.toThrow('loader fails'))
  })

  it('rejects if installation fails', () => {
    mockLoader.execute.mockReturnValue({ install: true, path: '.' })
    mockInstallPackage.mockImplementation(() => { throw new Error('install fails') })
    return matchLoader(args, genEnv())
      .then((executor) => expect(executor()).rejects.toThrow('install fails'))
  })
})
