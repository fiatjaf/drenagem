window.xtend = require('xtend')
const {h, run, reactive, track, select} = require('../../')

var state = reactive({
  name: select('.name-type')
    .events('change')
    .map(e => e.target.value),
  desc: select('.desc-type')
    .events('change')
    .map(e => e.target.value)
})

function Main () {
  let name = state.name

  return h('div.root', [
    h('input.name-type', {
      placeholder: 'type your name...',
      onChange: track
    }),
    h('h1', `hello ${name}`),
    h(Description)
  ])
}

function Description () {
  let desc = state.desc
  let name = state.name

  return h('div.description', [
    h('textarea.desc-type', {
      value: desc,
      onChange: track
    }),
    h('div', `${name}, you are ${desc}`)
  ])
}

run(document.getElementById('root'), Main)
