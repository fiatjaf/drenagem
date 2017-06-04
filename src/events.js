import xs from 'xstream'

/* --- track --- */

var eventStreams = xs.create()
export function track (e) {
  eventStreams['__global__'].shamefullySendNext({e, element: e.currentTarget})
}
track.preventDefault = function (e) {
  e.preventDefault()
  track(e)
}

track.withValue = function (value) {
  return (e) => {
    eventStreams['__global__'].shamefullySendNext({e, value, element: e.currentTarget})
  }
}
track.preventDefault.withValue = function (value) {
  return (e) => {
    e.preventDefault()
    eventStreams['__global__'].shamefullySendNext({e, value, element: e.currentTarget})
  }
}

track.tag = function (name, value) {
  let eventStream = eventStreams[name] || xs.create()
  eventStreams[name] = eventStream
  return e => {
    eventStreams['__global__'].shamefullySendNext({e, value, element: e.currentTarget})
    eventStream.shamefullySendNext({e, value, element: e.currentTarget})
  }
}
track.preventDefault.tag = function (name, value) {
  let eventStream = eventStreams[name] || xs.create()
  eventStreams[name] = eventStream
  return e => {
    e.preventDefault()
    eventStreams['__global__'].shamefullySendNext({e, value, element: e.currentTarget})
    eventStream.shamefullySendNext({e, value, element: e.currentTarget})
  }
}


/* --- select --- */

export function select (selector, tag = '__global__') {
  let ee = eventStreams[tag] || xs.create()
  eventStreams[tag] = ee

  ee = ee
    .filter(meta => matchesSelector(meta.element, selector))

  ee.events = function (selectedType) {
    return ee
      .filter(meta => meta.e.type === selectedType || !selectedType)
      .map(meta => meta.e)
  }

  return ee
}

var matchesSelector
if (typeof window !== 'undefined') {
  const proto = window.Element.prototype
  const vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector
  matchesSelector = function (elem, selector) {
    return vendor.call(elem, selector)
  }
} else {
  matchesSelector = function () { return false }
}

/* --- */
