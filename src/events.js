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

track.withData = function (data) {
  return (e) => {
    eventStreams['__global__'].shamefullySendNext({e, data, element: e.currentTarget})
  }
}
track.preventDefault.withData = function (data) {
  return (e) => {
    e.preventDefault()
    eventStreams['__global__'].shamefullySendNext({e, data, element: e.currentTarget})
  }
}

track.tag = function (name, data) {
  let eventStream = eventStreams[name] || xs.create()
  eventStreams[name] = eventStream
  return e => {
    eventStreams['__global__'].shamefullySendNext({e, data, element: e.currentTarget})
    eventStream.shamefullySendNext({e, data, element: e.currentTarget})
  }
}
track.preventDefault.tag = function (name, data) {
  let eventStream = eventStreams[name] || xs.create()
  eventStreams[name] = eventStream
  return e => {
    e.preventDefault()
    eventStreams['__global__'].shamefullySendNext({e, data, element: e.currentTarget})
    eventStream.shamefullySendNext({e, data, element: e.currentTarget})
  }
}

var anyStreams = xs.create()
track.any = function (name, data) {
  let anyStream = anyStreams[name] || xs.create()
  anyStreams[name] = anyStream
  anyStream.shamefullySendNext(data)
}


/* --- select --- */

export function select (selector, tag = '__global__') {
  let ee = eventStreams[tag] || xs.create()
  eventStreams[tag] = ee

  ee = ee
    .filter(meta => matchesSelector(meta.element, selector))

  ee.events = function (selectedType) {
    ee = ee
      .filter(meta => meta.e.type === selectedType || !selectedType)

    let normal = ee.map(meta => meta.e)

    normal.withData = function () {
      return ee.map(meta => ({event: meta.e, data: meta.data}))
    }

    return normal
  }

  return ee
}

select.any = function selectAny (name) {
  let anyStream = anyStreams[name] || xs.create()
  anyStreams[name] = anyStream
  return anyStream
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
