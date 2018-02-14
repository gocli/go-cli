import { prompt } from 'inquirer'
import chalk from 'chalk'

const guide = (commandTree, title = 'Choose command:', prefix = 'GO', stack = []) => {
  const question = {
    name: 'command',
    message: title,
    type: 'list',
    prefix: chalk.blueBright(`[${prefix}]`),
    choices: commandTree
      .map((command) => ({
        name: command.name + (command.description ? chalk.gray(` — ${command.description}`) : ''),
        short: command.name,
        value: command,
        disabled: command.disabled
      }))
      .sort((commandA, commandB) => commandA.name > commandB.name ? 1 : -1)
  }

  return prompt([ question ])
    .then(({ command }) => {
      stack.push(command.name)
      const chain = (tree) =>
        guide(tree, command.title, command.prefix || command.name.toUpperCase(), stack)

      if (Array.isArray(command.commands)) {
        return chain(command.commands)
      } else {
        return stack.join(' ')
      }
    })
}

export default guide
