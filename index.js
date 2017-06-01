const Set = require('es6-set')
const createClass = require('create-react-class')
const xs = require('xstream').default

var tracking = null

function observable (def) {
  var trackedrefs = {}
  var cachedvalues = {}
  var state = {}

  Object.keys(def).map(attr => {
    state[attr] = def[attr]

    trackedrefs[attr] = new Set()
    Object.defineProperty(state, attr, {
      get: () => {
        if (tracking) {
          let rerender = tracking
          trackedrefs[attr].add(rerender)
        }
        return cachedvalues[attr]
      }
    })

    let stream = def[attr]
    if (!stream.addListener) return
    stream.addListener({
      next: v => {
        cachedvalues[attr] = v
        trackedrefs[attr].forEach(rerender => {
          rerender()
        })
      },
      error: e => console.log(`error on stream ${attr}:`, e)
    })
  })

  return state
}

function observer (renderFunction) {
  let component = createClass({
    displayName: renderFunction.name,
    componentDidMount () {
      this._isMounted = true
    },
    componentWillUnmount () {
      this._isMounted = false
    },
    rerender () {
      if (this._isMounted) {
        console.log(`rerendering ${renderFunction.name} with props ${JSON.stringify(this.props)}.`)
        this.forceUpdate()
      }
    },
    render () {
      tracking = this.rerender
      tracking.id = `${renderFunction.name}, props ${JSON.stringify(this.props)}`
      let vdom = renderFunction.call(this, this.props)
      tracking = null
      return vdom
    }
  })

  return component
}

var eventstream = xs.create()
function track (e) {
  eventstream.shamefullySendNext({e, element: e.currentTarget, type: e.type})
}
track.named = function (name) {
  return e => {
    eventstream.shamefullySendNext({e, element: e.currentTarget, type: e.type, name})
  }
}

function select (selector) {
  return {
    events (selectedType) {
      return eventstream
        .filter(meta =>
          matchesSelector(meta.element, selector)
        )
        .filter(meta =>
          meta.type === selectedType
        )
        .map(meta =>
          meta.e
        )
    }
  }
}
// select.named = function (name) {
//
// }

const proto = window.Element.prototype
const vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector
function matchesSelector (elem, selector) {
  return vendor.call(elem, selector)
}

module.exports = {
  observable,
  observer,
  track,
  select
}
