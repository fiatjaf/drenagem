const Set = require('es6-set')
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
          console.log(`rerendering ${rerender.componentName}.`)
          rerender()
        })
      },
      error: e => console.log(`error on stream ${attr}:`, e),
      complete: () => console.log(`stream ${attr} is completed.`)
    })
  })

  return state
}

var componentCache = new Map()
function h (tag) {
  if (typeof tag === 'function') {
    let component = componentCache.get(tag) || createClass({
      displayName: tag.name,
      componentDidMount () {
        this._isMounted = true
      },
      componentWillUnmount () {
        this._isMounted = false
      },
      track () {
        let rerender = this.rerender
        rerender.componentName = tag.name
        tracking = rerender
      },
      rerender () {
        if (this._isMounted) {
          this.forceUpdate()
        }
      },
      componentWillMount () {
        this.track()
      },
      shouldComponentUpdate () {
        this.track()
        return true
      },
      render () {
        return tag.call(this, this.props)
      }
    })
    componentCache.set(tag, component)

    return require('react').createElement(component, arguments[1], arguments[2])
  }
  return require('react-hyperscript').apply(null, arguments)
}

function run (element, vrender) {
  render(h(vrender), element)
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
  h,
  run,
  reactive,
  track,
  select
}
