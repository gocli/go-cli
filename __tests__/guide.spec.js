const mockInquirer = (() => {
  const inquirer = {
    prompt: jest.fn()
  }
  return inquirer
})()
jest.mock('inquirer', () => mockInquirer)
const guide = require('../lib/guide')

const commands = [
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
          prefix: '\u001b[94m[GO]\u001b[39m',
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
              name: 'name 2\u001b[90m — desc 2\u001b[39m',
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
          prefix: '\u001b[94m[NAME 0]\u001b[39m',
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
          prefix: '\u001b[94m[NAME 0.1]\u001b[39m',
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
})
