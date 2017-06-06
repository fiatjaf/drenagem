const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const buble = require('rollup-plugin-buble')
const sourcemaps = require('rollup-plugin-sourcemaps')

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs({
      namedExports: {
        'react': [ 'Component' ],
        'react-dom': [ 'findDOMNode', 'render' ]
      }
    }),
    buble({ dangerousTaggedTemplateString: true }),
    sourcemaps()
  ],
  external: [ 'react', 'xstream', 'react-dom' ]
})
.then(bundle => {
  bundle.write({
    format: 'umd',
    dest: 'lib/dreno.umd.js',
    moduleName: 'dreno',
    moduleId: 'dreno',
    globals: {
      'xstream': 'xstream',
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  })
  .then(() => console.log('written lib/dreno.umd.js'))

  bundle.write({
    format: 'es',
    dest: 'lib/dreno.es.js',
    sourceMap: true
  })
  .then(() => console.log('written lib/dreno.es.js'))

  bundle.write({
    format: 'cjs',
    dest: 'lib/dreno.cjs.js',
    sourceMap: true
  })
  .then(() => console.log('written lib/dreno.cjs.js'))
})
.catch(e => console.log('error!', e))
