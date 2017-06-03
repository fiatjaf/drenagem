const xs = require('xstream').default

/* --- track --- */

let globalEventstream = xs.create()
function track (e) {
  globalEventstream.shamefullySendNext({e, element: e.currentTarget})
}
track.preventDefault = function (e) {
  e.preventDefault()
  track(e)
}

track.withValue = function (value) {
  return (e) => {
    globalEventstream.shamefullySendNext({e, value, element: e.currentTarget})
  }
}
track.preventDefault.withValue = function (value) {
  return (e) => {
    e.preventDefault()
    globalEventstream.shamefullySendNext({e, value, element: e.currentTarget})
  }
}

var namedEventstreams = {}
track.named = function (name, value) {
  let eventstream = namedEventstreams[name] || xs.create()
  namedEventstreams[name] = eventstream
  return e => {
    eventstream.shamefullySendNext({e, value, element: e.currentTarget})
  }
}
track.preventDefault.named = function (name, value) {
  let eventstream = namedEventstreams[name] || xs.create()
  namedEventstreams[name] = eventstream
  return e => {
    e.preventDefault()
    eventstream.shamefullySendNext({e, value, element: e.currentTarget})
  }
}


/* --- select --- */

function select (selector) {
  return {
    events (selectedType) {
      return globalEventstream
        .filter(meta =>
          matchesSelector(meta.element, selector)
        )
        .filter(meta =>
          meta.e.type === selectedType
        )
        .map(meta =>
          meta.value || meta.e
        )
    }
  }
}
select.named = function (name) {
  return namedEventstreams[name] || xs.empty()
}

const proto = window.Element.prototype
const vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector
function matchesSelector (elem, selector) {
  return vendor.call(elem, selector)
}

/* --- */

module.exports = {
  track,
  select
}
