const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const buble = require('rollup-plugin-buble')

let plugins = [
  resolve({
    jsnext: true,
    main: true,
    customResolveOptions: {
      moduleDirectory: 'node_modules'
    }
  }),
  commonjs({
    namedExports: {
      'react': [ 'Component' ]
    }
  }),
  buble({ dangerousTaggedTemplateString: true })
]

rollup.rollup({
  entry: 'src/index.js',
  plugins: plugins,
  external: [ 'react', 'xstream' ]
})
.then(bundle => {
  bundle.write({
    format: 'umd',
    dest: 'lib/dreno.umd.js',
    moduleName: 'dreno',
    moduleId: 'dreno',
    globals: {
      xstream: 'xstream',
      react: 'React'
    }
  })
  .then(() => console.log('written lib/dreno.umd.js'))

  bundle.write({
    format: 'es',
    dest: 'lib/dreno.es.js'
  })
  .then(() => console.log('written lib/dreno.es.js'))

  bundle.write({
    format: 'cjs',
    dest: 'lib/dreno.cjs.js'
  })
  .then(() => console.log('written lib/dreno.cjs.js'))
})
.catch(e => console.log('error!', e))
