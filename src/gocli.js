import Liftoff from 'liftoff'
import minimist from 'minimist'
import interpret from 'interpret'
import execute from './execute'

const gocli = (args) => {
  return new Promise((resolve, reject) => {
    const argv = minimist(args)

    const Cli = new Liftoff({
      name: 'go',
      processTitle: ['go'].concat(args).join(' '),
      extensions: interpret.jsVariants
    })

    const run = (env) => {
      execute(args, env)
        .then(resolve, reject)
    }

    Cli.launch({
      cwd: argv.cwd,
      configPath: argv.myappfile,
      require: argv.require,
      completion: argv.completion
    }, run)
  })
}

export default gocli
