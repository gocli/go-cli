const mockMatchCommand = jest.fn()
jest.mock('../lib/match-command', () => mockMatchCommand)
const mockMatchLoader = jest.fn()
jest.mock('../lib/match-loader', () => mockMatchLoader)
const mockMatchBinary = jest.fn()
jest.mock('../lib/match-binary', () => mockMatchBinary)

const invoke = require('../lib/invoke')

describe('Invoke', () => {
  const command = ['command']
  const noop = () => {}
  const genEnv = () => ({ check: Math.random() })

  beforeEach(() => {
    mockMatchCommand.mockReset()
    mockMatchCommand.mockResolvedValue(null)
    mockMatchLoader.mockReset()
    mockMatchLoader.mockResolvedValue(null)
    mockMatchBinary.mockReset()
    mockMatchBinary.mockResolvedValue(null)
  })

  it('calls each matcher to find an executor for given command', () => {
    const env = genEnv()
    const test = () => {
      expect(mockMatchCommand).toHaveBeenCalledTimes(1)
      expect(mockMatchCommand).toHaveBeenCalledWith(command, env)

      expect(mockMatchLoader).toHaveBeenCalledTimes(1)
      expect(mockMatchLoader).toHaveBeenCalledWith(command, env)

      expect(mockMatchBinary).toHaveBeenCalledTimes(1)
      expect(mockMatchBinary).toHaveBeenCalledWith(command, env)
    }
    return invoke(command, env).then(test, test)
  })

  it('rejects if executor is not found', () => {
    return expect(invoke(command, genEnv()))
      .rejects.toThrow('command is not recognized')
  })

  it('executes command if matchCommand resolves with the function', () => {
    const executor = jest.fn()
    executor.mockReturnValue(42)
    mockMatchCommand.mockResolvedValue(executor)
    return invoke(command, genEnv())
      .then((res) => {
        expect(res).toBe(42)
        expect(executor).toHaveBeenCalledTimes(1)
      })
  })

  it('does not call matchLoader and matchBinary if command executor is found', () => {
    mockMatchCommand.mockResolvedValue(noop)
    return invoke(command, genEnv())
      .then(() => {
        expect(mockMatchLoader).not.toHaveBeenCalled()
        expect(mockMatchBinary).not.toHaveBeenCalled()
      })
  })

  it('executes loader if matchLoader resolves with the function', () => {
    const executor = jest.fn()
    executor.mockReturnValue(42)
    mockMatchLoader.mockResolvedValue(executor)
    return invoke(command, genEnv())
      .then((res) => {
        expect(res).toBe(42)
        expect(executor).toHaveBeenCalledTimes(1)
      })
  })

  it('does not call matchBinary if command executor is found', () => {
    mockMatchLoader.mockResolvedValue(noop)
    return invoke(command, genEnv())
      .then(() => {
        expect(mockMatchBinary).not.toHaveBeenCalled()
      })
  })

  it('executes binary if matchBinary resolves with the function', () => {
    const executor = jest.fn()
    executor.mockReturnValue(42)
    mockMatchBinary.mockResolvedValue(executor)
    return invoke(command, genEnv())
      .then((res) => {
        expect(res).toBe(42)
        expect(executor).toHaveBeenCalledTimes(1)
      })
  })

  it('rejects if resolved value can not be executed', () => {
    mockMatchBinary.mockResolvedValue('string can not be executed')
    return expect(invoke(command, genEnv())).rejects.toThrow('executor is not a function')
  })
})
