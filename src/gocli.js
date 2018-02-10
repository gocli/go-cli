import Liftoff from 'liftoff'
import minimist from 'minimist'
import interpret from 'interpret'
import execute from './execute'

const gocli = (args) => {
  const argv = minimist(args)

  const Cli = new Liftoff({
    name: 'go',
    processTitle: ['go'].concat(args).join(' '),
    extensions: interpret.jsVariants
  })

  Cli.launch({
    cwd: argv.cwd,
    configPath: argv.myappfile,
    require: argv.require,
    completion: argv.completion
  }, execute.bind(null, args))
}

export default gocli
