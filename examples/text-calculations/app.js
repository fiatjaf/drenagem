window.xtend = require('xtend')
const xs = require('xstream').default
const h = require('react-hyperscript')
const render = require('react-dom').render
const React = require('react')
const {observable, observer, track, select} = require('../../')

let text = select('textarea')
  .events('change')
  .map(e => e.target.value)
  .startWith('banana split')

let clicked = select('.calculation')
  .events('click')
  .map(e => e.currentTarget.dataset.name)

let mouseenter = select('.calculation')
  .events('mouseenter')
  .map(e => e.currentTarget.dataset.name)

let mouseleave = select('.calculation')
  .events('mouseleave')
  .mapTo(e => null)

let hovered = xs.merge(mouseenter, mouseleave)

var state = observable({
  text,
  clicked,
  hovered,
  characters: text.map(t => t.length),
  lenghtiestword: text.map(t => Math.max.apply(Math, t.split(/\s+/g).map(w => w.length))),
  invertedtext: text.map(t => t.split('').reverse().join('')),
  numberoflines: text.map(t => t.split(/\n/g).length)
})

const Main = observer(function Main () {
  return (
    h('div', [
      h('label', [
        'type some text here: ',
        h('textarea', {
          style: {display: 'block'},
          rows: 6,
          onChange: track,
          value: state.text
        })
      ]),
      h('div', [
        'characters',
        'lenghtiestword',
        'invertedtext',
        'numberoflines'
      ].map(calculation =>
        h(CalculationShow, {key: calculation, calculation})
      ))
    ])
  )
})

const CalculationShow = observer(function CalculationShow ({calculation}) {
  let hovered = state.hovered === calculation
  let clicked = state.clicked === calculation

  return (
    h('.calculation', {
      onClick: track,
      onMouseEnter: track,
      onMouseLeave: track,
      'data-name': calculation,
      style: {
        padding: '5px',
        backgroundColor: clicked
        ? 'lightblue'
        : hovered
          ? 'wheat'
          : 'transparent'
      }
    }, [
      `${calculation}: `,
      h('strong', state[calculation])
    ])
  )
})

render(React.createElement(Main), document.getElementById('root'))
