const matchLoader = (argv) =>
  argv._[0] && argv._[0].indexOf(':') === 0

export default matchLoader
