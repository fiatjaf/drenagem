window.xtend = require('xtend')
const fetch = window.fetch
const h = require('react-hyperscript')
const render = require('react-dom').render
const React = require('react')
const xs = require('xstream').default
const flattenConcurrently = require('xstream/extra/flattenConcurrently').default
const Highlight = require('react-highlight')
const {observable, observer, track, select} = require('dreno')

let examples = xs.fromPromise(
  fetch('https://api.github.com/repos/fiatjaf/drenagem/git/trees/master')
  .then(r => r.json())
  .then(({tree}) => {
    for (let i = 0; i < tree.length; i++) {
      let f = tree[i]
      if (f.path === 'examples') {
        return fetch(`https://api.github.com/repos/fiatjaf/drenagem/git/trees/${f.sha}`)
      }
    }
  })
  .then(r => r.json())
)
  .map(({tree}) => ['.'].concat(
    tree
      .filter(f => f.type === 'tree')
      .map(f => f.path)
  ))

let selected = select('.example-item a')
  .events('click')
  .map(e => e.currentTarget.href.split('#')[1].slice(1))
  .startWith(location.hash.slice(2) || 'add-one')

let code = selected
  .map(name => xs.fromPromise(Promise.all([
    name,
    fetch(`${name}/app.js`).then(r => r.text())
  ])))
  .compose(flattenConcurrently)
  .fold((acc, [name, code]) => {
    acc[name] = code
    return acc
  }, {})

const state = observable({
  examples: examples.startWith([]),
  code: code.startWith({}),
  selected
})

const Main = observer(function Main () {
  return (
    h('main', [
      h(List),
      h(Code),
      h(Output)
    ])
  )
})

const List = observer(function List () {
  return (
    h('.column', [
      h('ul', state.examples.map(name =>
        h('li.example-item', {
          key: name,
          style: {
            display: 'block',
            listStyle: 'none',
            margin: '4px'
          }
        }, [
          h('a', {
            onClick: track,
            href: `#/${name}`,
            style: {
              textDecoration: 'none',
              padding: '7px',
              color: '#333',
              backgroundColor: state.selected === name ? '#e8fddb' : 'transparent'
            }
          }, name)
        ])
      ))
    ])
  )
})

const Code = observer(function Code () {
  let code = state.code[state.selected] || ''

  return (
    h('.column', [
      h(Highlight, {className: 'javascript'}, code)
    ])
  )
})

const Output = observer(function Output () {
  let name = state.selected

  return (
    h('.column', [
      h('iframe', {src: `${name}/index.html`})
    ])
  )
})

render(React.createElement(Main), document.getElementById('root'))
