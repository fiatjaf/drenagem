const xs = require('xstream').default

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
  track,
  select
}
