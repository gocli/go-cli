const mockInquirer = (() => {
  const inquirer = {
    prompt: jest.fn()
  }
  return inquirer
})()
jest.mock('inquirer', () => mockInquirer)

const mockChalkFormatter = str => str
jest.mock('chalk', () => ({
  blueBright: mockChalkFormatter,
  gray: mockChalkFormatter
}))

const guide = require('../lib/guide')

const commands = [ // links to parent commands are droped
  {
    name: 'name 0',
    commands: [
      {
        name: 'name 0.1',
        title: 'deep',
        commands: [
          { name: 'name 0.1.1' }
        ]
      },
      {
        name: 'name 0.2'
      }
    ]
  },
  {
    name: 'name 2',
    description: 'desc 2',
    disabled: true
  },
  {
    name: 'name 1'
  }
]

describe('Guide', () => {
  it('rejects if there are no commands', () => {
    return Promise.all([
      expect(guide()).rejects.toThrow('no commands found'),
      expect(guide([])).rejects.toThrow('no commands found')
    ])
  })

  it('prompts nested commands', () => {
    mockInquirer.prompt.mockReset()
    mockInquirer.prompt.mockImplementation(([ command ]) => {
      return Promise.resolve({ command: command.choices[0].value })
    })
    return guide(commands)
      .then(() => {
        const args = mockInquirer.prompt.mock.calls

        expect(args.length).toBe(3)

        expect(args[0][0][0]).toEqual({
          name: 'command',
          message: 'Choose command:',
          type: 'list',
          prefix: '[GO]',
          choices: [
            {
              disabled: false,
              name: 'name 0',
              short: 'name 0',
              value: {
                name: 'name 0',
                commands: [
                  {
                    name: 'name 0.1',
                    title: 'deep',
                    commands: [
                      { name: 'name 0.1.1' }
                    ]
                  },
                  { name: 'name 0.2' }
                ]
              }
            },
            {
              disabled: false,
              name: 'name 1',
              short: 'name 1',
              value: { name: 'name 1' }
            },
            {
              disabled: true,
              name: 'name 2 — desc 2',
              short: 'name 2',
              value: {
                name: 'name 2',
                description: 'desc 2',
                disabled: true
              }
            }
          ]
        })

        expect(args[1][0][0]).toEqual({
          name: 'command',
          message: 'Choose command:',
          type: 'list',
          prefix: '[NAME 0]',
          choices: [
            {
              disabled: false,
              name: 'name 0.1',
              short: 'name 0.1',
              value: {
                name: 'name 0.1',
                title: 'deep',
                commands: [
                  { name: 'name 0.1.1' }
                ]
              }
            },
            {
              disabled: false,
              name: 'name 0.2',
              short: 'name 0.2',
              value: { name: 'name 0.2' }
            }
          ]
        })

        expect(args[2][0][0]).toEqual({
          name: 'command',
          message: 'deep',
          type: 'list',
          prefix: '[NAME 0.1]',
          choices: [
            {
              disabled: false,
              name: 'name 0.1.1',
              short: 'name 0.1.1',
              value: { name: 'name 0.1.1' }
            }
          ]
        })
      })
  })

  it('resolves with a matched command', () => {
    mockInquirer.prompt.mockReset()
    mockInquirer.prompt.mockImplementation(([ command ]) => {
      return Promise.resolve({ command: command.choices[0].value })
    })
    return guide(commands)
      .then(command => {
        expect(command).toEqual(commands[0].commands[0].commands[0])
      })
  })
})
