window.xtend = require('xtend')
const h = require('react-hyperscript')
const render = require('react-dom').render
const React = require('react')
const {observable, observer, track, select} = require('../../')

var state = observable({
  name: select('.name-type')
    .events('change')
    .map(e => e.target.value),
  desc: select('.desc-type')
    .events('change')
    .map(e => e.target.value)
})

const Main = observer(function Main () {
  let name = state.name

  return h('div.root', [
    h('input.name-type', {
      placeholder: 'type your name...',
      onChange: track
    }),
    h('h1', `hello ${name}`),
    h(Description)
  ])
})

const Description = observer(function Description () {
  let desc = state.desc
  let name = state.name

  return h('div.description', [
    h('textarea.desc-type', {
      value: desc,
      onChange: track
    }),
    h('div', `${name}, you are ${desc}`)
  ])
})

render(React.createElement(Main), document.getElementById('root'))
