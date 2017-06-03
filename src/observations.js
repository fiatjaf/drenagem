import Set from 'es6-set'
import { Component } from 'react'

var tracking = null

export function observable (def) {
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

export function observer (component) {
  // the given component is a function, not a proper react component class
  if (typeof component === 'function' &&
      (!component.prototype || !component.prototype.render) &&
      !Component.isPrototypeOf(component) &&
      !component.isReactClass) {
    // wrap it in a react component
    class wrapped extends Component {
      render () { return component.call(this, this.props, this.context) }
    }
    wrapped.displayName = component.displayName || component.name
    wrapped.propTypes = component.propTypes
    wrapped.contextTypes = component.contextTypes
    wrapped.defaultProps = component.defaultProps

    return observer(wrapped)
  }

  let name = `<${component.displayName ||
             component.prototype && component.prototype.displayName ||
             'unnamed-component'}>`

  // now we are sure the component is a proper react component class
  // we can only patch it.
  let target = component.prototype || component
  for (let func in reactiveMixin) {
    let base = target[func]
    target[func] = base
      ? function () {
        base.apply(this, arguments)
        reactiveMixin[func].apply(this, arguments)
      }
      : reactiveMixin[func]
  }

  let baseRender = component.prototype.render
  component.prototype.render = function () {
    tracking = this.rerender
    console.log(`rendering ${name} with props ${JSON.stringify(this.props)}.`)
    let vdom = baseRender.call(this, this.props, this.context)
    tracking = null
    return vdom
  }

  return component
}

function rerender () {
  if (this.___isMounted) {
    this.forceUpdate()
  }
}

const reactiveMixin = {
  componentWillMount () {
    this.___isMounted = true
    this.rerender = rerender.bind(this)
  },
  componentWillUnmount () {
    this.___isMounted = false
  }
}
