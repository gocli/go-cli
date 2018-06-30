const mockLaunch = jest.fn()
const mockLiftoff = jest.fn()
jest.mock('liftoff', () => mockLiftoff)
jest.mock('interpret', () => ({ jsVariants: { js: null } }))
const mockInvoke = jest.fn().mockResolvedValue(null)
jest.mock('../lib/invoke', () => mockInvoke)
const gocli = require('../lib/index')

describe('gocli (index)', () => {
  beforeEach(() => {
    mockLaunch.mockReset()
    mockLiftoff.mockReset()
    mockLiftoff.mockImplementation(() => ({ launch: mockLaunch }))
  })

  it('calls Liftoff', () => {
    gocli(['command'])

    expect(mockLiftoff).toHaveBeenCalledWith({
      name: 'go',
      processTitle: 'go command',
      extensions: { js: null }
    })

    expect(mockLaunch.mock.calls[0][0]).toEqual({
      cwd: undefined,
      configPath: undefined,
      require: undefined,
      completion: undefined
    })
  })

  it('sets Liftoff values from command', () => {
    gocli([
      'command',
      '--cwd', '.',
      '--config', 'config.json',
      '--require', 'babel-loader',
      '--completion', 'completions.sh'
    ])

    expect(mockLaunch.mock.calls[0][0]).toEqual({
      cwd: '.',
      configPath: 'config.json',
      require: 'babel-loader',
      completion: 'completions.sh'
    })
  })

  it('calls run that triggers invoke', () => {
    gocli(['command'])

    const run = mockLaunch.mock.calls[0][1]
    const env = { env: true }
    run(env)

    expect(mockInvoke).toHaveBeenCalledWith(['command'], env)
  })
})
