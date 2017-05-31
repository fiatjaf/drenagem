const createClass = require('create-react-class')
const render = require('react-dom').render
const xs = require('xstream').default

var trackedrefs = {}
var tracking = null

function reactive (def) {
  var cachedvalues = {}
  var state = {}

  Object.keys(def).map(attr => {
    state[attr] = def[attr]

    trackedrefs[attr] = new Map()
    Object.defineProperty(state, attr, {
      get: () => {
        if (tracking) {
          let {tag, trackref, component} = tracking
          console.log(`tracking .${attr} access from ${component.displayName}.`)
          trackedrefs[attr].set(tag, trackref)
        }
        return cachedvalues[attr]
      }
    })

    let stream = def[attr]
    if (!stream.addListener) return
    stream.addListener({
      next: v => {
        cachedvalues[attr] = v
        trackedrefs[attr].forEach(ref => {
          if (ref.forceUpdate) ref.forceUpdate()
        })
      },
      error: e => console.log(`error on stream ${attr}:`, e),
      complete: () => console.log(`stream ${attr} is completed.`)
    })
  })

  return state
}

function h (tag) {
  if (typeof tag === 'function') {
    var trackref = {}
    let component = createClass({
      displayName: tag.name,
      componentDidMount () {
        trackref.forceUpdate = () => {
          console.log(`forceUpdating ${tag.name}.`)
          this.forceUpdate()
        }
      },
      render () {
        return tag.call(this, this.props)
      }
    })

    tracking = {tag, trackref, component}
    try {
      tag({})
    } catch (e) {}
    tracking = null
    return require('react').createElement(component, arguments[1], arguments[2])
  }
  return require('react-hyperscript').apply(null, arguments)
}

function run (element, vrender) {
  render(h(vrender), element)
}

var eventstream = xs.create()
  .debug('event')
function track (e) {
  console.log('tracked event', e)
  eventstream.shamefullySendNext({e, element: e.target, type: e.type})
}
track.named = function (name) {
  return e => {
    eventstream.shamefullySendNext({e, element: e.target, type: e.type, name})
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
  h,
  run,
  reactive,
  track,
  select
}
