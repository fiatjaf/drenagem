const Set = require('es6-set')
const React = require('react')
const createClass = require('create-react-class')
const mixin = require('react-mixin')

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

function observer (component) {
  // the given component is a function, not a proper react component class
  if (typeof component === 'function' &&
      (!component.prototype || !component.prototype.render) &&
      !React.Component.isPrototypeOf(component) &&
      !component.isReactClass) {
    // wrap it in a react component
    return observer(createClass({
      displayName: component.name,
      propTypes: component.propTypes,
      contextTypes: component.contextTypes,
      defaultProps: component.defaultProps,
      render () { return component.call(this, this.props, this.context) }
    }))
  }

  // now we are sure the component is a proper react component class
  // we can only patch it.
  mixin(component.prototype, reactiveMixin)

  let baseRender = component.prototype.render
  component.prototype.render = function () {
    tracking = this.rerender
    let vdom = baseRender.call(this, this.props, this.context)
    tracking = null
    return vdom
  }

  return component
}

function rerender () {
  console.log(`rerendering ${this.displayName} with props ${JSON.stringify(this.props)}.`)
  this.forceUpdate()
}

const reactiveMixin = {
  componentWillMount () {
    let rr = this._rerender || rerender.bind(this)
    this._rerender = rr
    this.rerender = rr
  },
  componentWillUnmount () {
    this.rerender = () => {}
  }
}

module.exports = {
  observer,
  observable
}
