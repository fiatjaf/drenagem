import { Component } from 'react'
import { report } from './debug'

var tracker = null
var allObservables = new Set()

class Observable {
  constructor (initialValues = {}) {
    var streams = {}
    var cache = {}
    var observers = new Map()
    var trackedattrs = {}

    Object.defineProperty(this, '$', {get: () => streams})
    Object.defineProperty(this, 'cache', {get: () => cache})
    Object.defineProperty(this, 'observers', {get: () => observers})
    Object.defineProperty(this, 'trackedattrs', {get: () => trackedattrs})

    allObservables.add(this)

    for (let attr in initialValues) {
      let v = initialValues[attr]
      this.set(attr, v)
    }
  }

  get (attr) {
    return this[attr]
  }

  set (attr, v) {
    if (v.setDebugListener) {
      // is a xstream stream.
      // make it read values from the cache.
      Object.defineProperty(this, attr, {
        get: () => {
          // register property access
          this.registerAccess(tracker, attr)
          return this.cache[attr]
        },
        enumerable: true
      })

      // then start listening listen to the stream events
      // to update the this.cache.
      let stream = v
      stream.addListener({
        next: v => {
          if (v !== this.cache[attr]) {
            this.cache[attr] = v

            // every time an attribute is updated we
            // tell all its observers to rerun.
            this.trackedattrs[attr] = this.trackedattrs[attr] || new Set()
            this.trackedattrs[attr].forEach(rerun => {
              rerun()
            })
          }
        },
        error: e => {
          console.error(`error on stream ${attr}:`, e)
          this.cache[attr] = e
        }
      })
      this.$[attr] = stream
    } else {
      // a normal value. just store the value.
      this[attr] = v
    }
  }

  has (attr) {
    return attr in this
  }

  keys () {
    return Object.keys(this)
  }

  values () {
    return Object.keys(this).map(attr => this[attr])
  }

  entries () {
    return Object.keys(this).map(attr => [attr, this[attr]])
  }

  forEach (callback, thisArg) {
    for (let attr in this) {
      callback.call(thisArg, attr, this[attr])
    }
  }

  registerAccess (observer, attr) {
    let attrs = this.observers.get(observer) || new Set()
    attrs.add(attr)
    this.observers.set(observer, attrs)
    this.trackedattrs[attr] = this.trackedattrs[attr] || new Set()
    this.trackedattrs[attr].add(observer)
  }

  resetTrackedProperties (observer) {
    let attrs = this.observers.get(observer) || []
    attrs.forEach((attr) => {
      this.trackedattrs[attr].delete(observer)
    })
    this.observers.set(observer, new Set())
  }
}

export function observable (def) {
  return new Observable(def)
}

export function observer (component) {
  // the given component is a function, not a proper react component class
  if (typeof component === 'function' &&
      (!component.prototype || !component.prototype.render) &&
      !Component.isPrototypeOf(component) &&
      !component.isReactClass) {
    // wrap it in a react component
    const wrapped = class extends Component {
      render () { return component.call(this, this.props, this.context) }
    }
    wrapped.displayName = component.displayName || component.name
    wrapped.prototype.displayName = component.displayName || component.name
    wrapped.propTypes = component.propTypes
    wrapped.contextTypes = component.contextTypes
    wrapped.defaultProps = component.defaultProps

    return observer(wrapped)
  }

  // let name = `<${component.displayName ||
  //            component.prototype && component.prototype.displayName ||
  //            'unnamed-component'}>`

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
    allObservables.forEach(o => {
      o.resetTrackedProperties(o)
    })

    // console.log(`rendering ${name} with props ${JSON.stringify(this.props)}.`)

    tracker = this.rerender
    let vdom = baseRender.call(this, this.props, this.context)
    tracker = null

    return vdom
  }

  return component
}

function rerender () {
  if (this.___isMounted) {
    report.render(this)
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
