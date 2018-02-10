import buble from 'rollup-plugin-buble'
import standard from 'rollup-plugin-standard'

export default {
  entry: 'src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    standard(),
    buble({ objectAssign: 'Object.assign' })
  ]
}
