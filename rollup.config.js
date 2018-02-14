import buble from 'rollup-plugin-buble'
import standard from 'rollup-plugin-standard'

export default {
  input: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
    sourcemap: true
  },
  external: [
    'chalk',
    'child_process',
    'fs',
    'inquirer',
    'interpret',
    'is-git-url',
    'liftoff',
    'minimist',
    'path',
    'resolve-global',
    'which'
  ],
  plugins: [
    standard(),
    buble({ objectAssign: 'Object.assign' })
  ]
}
