window.xtend = require('xtend')
const xs = require('xstream').default
const h = require('react-hyperscript')
const render = require('react-dom').render
const React = require('react')
const createClass = require('create-react-class')
const {observable, observer, track, select} = require('dreno')

let usersCreated = select('.new')
  .events('click')
  .map(e => e.preventDefault() || e)
  .fold((acc, e) => {
    let id = Math.random().toString().slice(-5)
    return [
      observable({
        id: xs.of(id),
        name: select('.user input[name="name"]')
          .events('change')
          .filter(e => e.currentTarget.parentNode.parentNode.dataset.id === id)
          .map(e => e.target.value)
          .startWith('new name')
      })
    ].concat(acc)
  }, [])

let deleted = select('button.del')
  .events('click')
  .startWith(null)

let users = xs.combine(usersCreated, deleted)
  .map(([users, deleted]) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === deleted) {
        users.splice(i, 1)
        return users
      }
    }
    return users
  })

var state = observable({
  users: users.startWith([])
})

const Main = observer(function Main () {
  return (
    h('div', [
      h('button.new', {
        onClick: track.preventDefault
      }, 'add a user'),
      h('div', state.users.map(({id}, index) =>
        h(User, {key: id, index})
      ))
    ])
  )
})

const User = observer(createClass({
  displayName: 'User',
  render () {
    let {id, name} = state.users[this.props.index]

    return (
      h('.user', {
        style: {
          margin: '8px',
          padding: '8px',
          border: '3px dotted #3490ff'
        },
        'data-id': id
      }, [
        h('div', [
          'type a name: ',
          h('input', {
            name: 'name',
            value: name,
            onChange: track
          }),
          h('button.del', {
            onClick: track.preventDefault.withValue(id)
          }, 'delete')
        ]),
        h('span', `the id is "${id}", the name is "${name}".`)
      ])
    )
  }
}))

render(React.createElement(Main), document.getElementById('root'))
