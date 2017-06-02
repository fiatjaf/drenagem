window.xtend = require('xtend')
const xs = require('xstream').default
const h = require('react-hyperscript')
const render = require('react-dom').render
const React = require('react')
const createClass = require('create-react-class')
const {observable, observer, track, select} = require('../../')

let names = select('.new')
  .events('click')
  .map(e => e.preventDefault() || e)
  .fold((acc, e) => {
    let id = Math.random().toString().slice(-5)
    return [
      observable({
        id: xs.of(id),
        name: select('.name input')
          .events('change')
          .filter(e => e.currentTarget.parentNode.parentNode.dataset.id === id)
          .map(e => e.target.value)
          .startWith('new name')
      })
    ].concat(acc)
  }, [])

var state = observable({
  names
})

const Main = observer(function Main () {
  return (
    h('div', [
      h('button.new', {
        onClick: track
      }, 'add a name'),
      h('div', state.names.map(({id}, index) =>
        h(Name, {key: id, index})
      ))
    ])
  )
})

const Name = observer(createClass({
  displayName: 'Name!',
  render () {
    let {id, name} = state.names[this.props.index]

    return (
      h('.name', {
        style: {
          margin: '8px',
          padding: '8px',
          border: '3px dotted #3490ff'
        },
        'data-id': id
      }, [
        h('div', [
          'type a name: ',
          h('input', {value: name, onChange: track})
        ]),
        h('span', `the id is "${id}", the name is "${name}".`)
      ])
    )
  }
}))

render(React.createElement(Main), document.getElementById('root'))
