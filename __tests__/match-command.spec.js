const mockGuide = jest.fn()
jest.mock('../lib/guide', () => mockGuide)
const mockModule = {
  executeCommand: jest.fn(),
  getCommands: jest.fn(),
  matchCommand: jest.fn()
}
jest.mock('./data/match-command-module', () => mockModule)
const mockConfig = jest.fn()
jest.mock('./data/match-command-config', () => mockConfig)

const { resolve } = require('path')
const matchCommand = require('../lib/match-command')

describe('Match Command', () => {
  const command = ['the', 'command']
  const modulePath = resolve(__dirname, './data/match-command-module.js')
  const configPath = resolve(__dirname, './data/match-command-config.js')
  const env = { modulePath, configPath }
  const localCommands = ['command 1', 'command 2']
  const matchedCommand = 'command 2'

  beforeEach(() => {
    mockGuide.mockReset()
    mockGuide.mockResolvedValue({ name: 'cmd', callback: jest.fn() })

    mockModule.getCommands.mockReset()
    mockModule.getCommands.mockReturnValue(localCommands)
    mockModule.matchCommand.mockReset()
    mockModule.matchCommand.mockReturnValue(matchedCommand)
    mockModule.executeCommand.mockReset()

    mockConfig.mockReset()
  })

  it('resolves with null if env is empty', () => {
    return expect(matchCommand(command, {})).resolves.toBe(null)
  })

  it('resolves with null if env.configPath is not defined', () => {
    return expect(matchCommand(command, { modulePath })).resolves.toBe(null)
  })

  it('resolves with null if env.modulePath is not defined', () => {
    return expect(matchCommand(command, { configPath })).resolves.toBe(null)
  })

  it('calls to guide if arguments list is empty', () => {
    return matchCommand([], env)
      .then((executor) => {
        executor()
        expect(mockGuide).toHaveBeenCalledTimes(1)
        expect(mockGuide).toHaveBeenCalledWith(localCommands)
      })
  })

  it('rejects if guide rejects', () => {
    return matchCommand([], env)
      .then((executor) => {
        mockGuide.mockRejectedValueOnce('fail')
        return expect(executor()).rejects.toMatch('fail')
      })
  })

  it('executes command, resolved by guide', () => {
    const callback = jest.fn()
    return matchCommand([], env)
      .then((executor) => {
        mockGuide.mockResolvedValue({ name: 'cmd', callback })
        return executor()
      })
      .then(() => {
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenLastCalledWith({ args: { _: ['cmd'] } })
      })
  })

  it('executes nested command, resolved by guide, with proper arguments', () => {
    const callback = jest.fn()
    return matchCommand([], env)
      .then((executor) => {
        mockGuide.mockResolvedValue({ name: 'child', callback, parent: { name: 'parent' } })
        return executor()
      })
      .then(() => {
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenLastCalledWith({ args: { _: ['parent', 'child'] } })
      })
  })

  it('resolves with null if Go returns empty list of commands', () => {
    mockModule.getCommands.mockReturnValue([])
    return expect(matchCommand(command, env)).resolves.toBe(null)
  })

  it('executes command that is found using go.matchCommand', () => {
    return matchCommand(command, env)
      .then((executor) => {
        expect(mockModule.matchCommand).toHaveBeenCalledTimes(1)
        expect(mockModule.matchCommand).toHaveBeenCalledWith('the command')
      })
  })

  it('resolves with null if go.matchCommand can not find command', () => {
    mockModule.matchCommand.mockReturnValue(null)
    return expect(matchCommand(command, env)).resolves.toBe(null)
  })

  it('calls go.executeCommand with matched command', () => {
    mockModule.matchCommand.mockReturnValue(matchedCommand)
    return matchCommand(matchedCommand.split(' '), env)
      .then((executor) => {
        executor()
        expect(mockModule.executeCommand).toHaveBeenCalledTimes(1)
        expect(mockModule.executeCommand).toHaveBeenCalledWith(matchedCommand)
      })
  })
})
