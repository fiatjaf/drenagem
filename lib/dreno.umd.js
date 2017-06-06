(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react-dom'), require('react'), require('xstream')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react-dom', 'react', 'xstream'], factory) :
	(factory((global.dreno = global.dreno || {}),global.ReactDOM,global.React,global.xstream));
}(this, (function (exports,reactDom,react,xs) { 'use strict';

xs = 'default' in xs ? xs['default'] : xs;

var tracker = null;
var allObservables = new Set();

var Observable = function Observable (initialValues) {
  var this$1 = this;
  if ( initialValues === void 0 ) initialValues = {};

  var streams = {};
  var cache = {};
  var observers = new Map();
  var trackedattrs = {};

  Object.defineProperty(this, '$', {get: function () { return streams; }});
  Object.defineProperty(this, 'cache', {get: function () { return cache; }});
  Object.defineProperty(this, 'observers', {get: function () { return observers; }});
  Object.defineProperty(this, 'trackedattrs', {get: function () { return trackedattrs; }});

  allObservables.add(this);

  for (var attr in initialValues) {
    var v = initialValues[attr];
    this$1.set(attr, v);
  }
};

Observable.prototype.get = function get (attr) {
  return this[attr]
};

Observable.prototype.set = function set (attr, v) {
    var this$1 = this;

  if (v.setDebugListener) {
    // is a xstream stream.
    // make it read values from the cache.
    Object.defineProperty(this, attr, {
      get: function () {
        // register property access
        this$1.registerAccess(tracker, attr);
        return this$1.cache[attr]
      },
      enumerable: true
    });

    // then start listening listen to the stream events
    // to update the this.cache.
    var stream = v;
    stream.addListener({
      next: function (v) {
        this$1.cache[attr] = v;

        // every time an attribute is updated we
        // tell all its observers to rerun.
        this$1.trackedattrs[attr] = this$1.trackedattrs[attr] || new Set();
        this$1.trackedattrs[attr].forEach(function (rerun) {
          rerun();
        });
      },
      error: function (e) {
        console.error(("error on stream " + attr + ":"), e);
        this$1.cache[attr] = e;
      }
    });
    this.$[attr] = stream;
  } else {
    // a normal value. just store the value.
    this[attr] = v;
  }
};

Observable.prototype.has = function has (attr) {
  return attr in this
};

Observable.prototype.keys = function keys () {
  return Object.keys(this)
};

Observable.prototype.values = function values () {
    var this$1 = this;

  return Object.keys(this).map(function (attr) { return this$1[attr]; })
};

Observable.prototype.entries = function entries () {
    var this$1 = this;

  return Object.keys(this).map(function (attr) { return [attr, this$1[attr]]; })
};

Observable.prototype.forEach = function forEach (callback, thisArg) {
    var this$1 = this;

  for (var attr in this$1) {
    callback.call(thisArg, attr, this$1[attr]);
  }
};

Observable.prototype.registerAccess = function registerAccess (observer, attr) {
  var attrs = this.observers.get(observer) || new Set();
  attrs.add(attr);
  this.observers.set(observer, attrs);
  this.trackedattrs[attr] = this.trackedattrs[attr] || new Set();
  this.trackedattrs[attr].add(observer);
};

Observable.prototype.resetTrackedProperties = function resetTrackedProperties (observer) {
    var this$1 = this;

  var attrs = this.observers.get(observer) || [];
  attrs.forEach(function (attr) {
    this$1.trackedattrs[attr].delete(observer);
  });
  this.observers.set(observer, new Set());
};

function observable (def) {
  return new Observable(def)
}

function observer (component) {
  // the given component is a function, not a proper react component class
  if (typeof component === 'function' &&
      (!component.prototype || !component.prototype.render) &&
      !react.Component.isPrototypeOf(component) &&
      !component.isReactClass) {
    // wrap it in a react component
    var wrapped = (function (Component$$1) {
      function wrapped () {
        Component$$1.apply(this, arguments);
      }

      if ( Component$$1 ) wrapped.__proto__ = Component$$1;
      wrapped.prototype = Object.create( Component$$1 && Component$$1.prototype );
      wrapped.prototype.constructor = wrapped;

      wrapped.prototype.render = function render$$1 () { return component.call(this, this.props, this.context) };

      return wrapped;
    }(react.Component));
    wrapped.displayName = component.displayName || component.name;
    wrapped.prototype.displayName = component.displayName || component.name;
    wrapped.propTypes = component.propTypes;
    wrapped.contextTypes = component.contextTypes;
    wrapped.defaultProps = component.defaultProps;

    return observer(wrapped)
  }

  // let name = `<${component.displayName ||
  //            component.prototype && component.prototype.displayName ||
  //            'unnamed-component'}>`

  // now we are sure the component is a proper react component class
  // we can only patch it.
  var target = component.prototype || component;
  var loop = function ( func ) {
    var base = target[func];
    target[func] = base
      ? function () {
        base.apply(this, arguments);
        reactiveMixin[func].apply(this, arguments);
      }
      : reactiveMixin[func];
  };

  for (var func in reactiveMixin) loop( func );

  var baseRender = component.prototype.render;
  component.prototype.render = function () {
    allObservables.forEach(function (o) {
      o.resetTrackedProperties(o);
    });

    // console.log(`rendering ${name} with props ${JSON.stringify(this.props)}.`)

    tracker = this.rerender;
    var vdom = baseRender.call(this, this.props, this.context);
    tracker = null;

    return vdom
  };

  return component
}

function rerender () {
  if (this.___isMounted) {
    report.render(this);
    this.forceUpdate();
  }
}

var reactiveMixin = {
  componentWillMount: function componentWillMount () {
    this.___isMounted = true;
    this.rerender = rerender.bind(this);
  },
  componentWillUnmount: function componentWillUnmount () {
    this.___isMounted = false;
  }
};

/* --- track --- */

var eventStreams = xs.create();
function track (e) {
  eventStreams['__global__'].shamefullySendNext({e: e, element: e.currentTarget});
}
track.preventDefault = function (e) {
  e.preventDefault();
  track(e);
};

track.withData = function (data) {
  return function (e) {
    eventStreams['__global__'].shamefullySendNext({e: e, data: data, element: e.currentTarget});
  }
};
track.preventDefault.withData = function (data) {
  return function (e) {
    e.preventDefault();
    eventStreams['__global__'].shamefullySendNext({e: e, data: data, element: e.currentTarget});
  }
};

track.tag = function (name, data) {
  var eventStream = eventStreams[name] || xs.create();
  eventStreams[name] = eventStream;
  return function (e) {
    eventStreams['__global__'].shamefullySendNext({e: e, data: data, element: e.currentTarget});
    eventStream.shamefullySendNext({e: e, data: data, element: e.currentTarget});
  }
};
track.preventDefault.tag = function (name, data) {
  var eventStream = eventStreams[name] || xs.create();
  eventStreams[name] = eventStream;
  return function (e) {
    e.preventDefault();
    eventStreams['__global__'].shamefullySendNext({e: e, data: data, element: e.currentTarget});
    eventStream.shamefullySendNext({e: e, data: data, element: e.currentTarget});
  }
};

var anyStreams = xs.create();
track.any = function (name, data) {
  var anyStream = anyStreams[name] || xs.create();
  anyStreams[name] = anyStream;
  anyStream.shamefullySendNext(data);
};


/* --- select --- */

function select (selector, tag) {
  if ( tag === void 0 ) tag = '__global__';

  var ee = eventStreams[tag] || xs.create();
  eventStreams[tag] = ee;

  ee = ee
    .filter(function (meta) { return matchesSelector(meta.element, selector); });

  ee.events = function (selectedType) {
    ee = ee
      .filter(function (meta) { return meta.e.type === selectedType || !selectedType; });

    var normal = ee.map(function (meta) { return meta.e; });

    normal.withData = function () {
      return ee.map(function (meta) { return ({event: meta.e, data: meta.data}); })
    };

    return normal
  };

  return ee
}

select.any = function selectAny (name) {
  var anyStream = anyStreams[name] || xs.create();
  anyStreams[name] = anyStream;
  return anyStream
};

var matchesSelector;
if (typeof window !== 'undefined') {
  var proto = window.Element.prototype;
  var vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
  matchesSelector = function (elem, selector) {
    return vendor.call(elem, selector)
  };
} else {
  matchesSelector = function () { return false };
}

/* --- */

function debug () {
  var nodecache = new Map();

  report.render = function reportRender (component) {
    var node = reactDom.findDOMNode(component);
    if (!node) { return }
    if (component.displayName === 'Box' ||
        component.displayName === 'DevTool') { return }

    var rect = node.getBoundingClientRect();
    var id = nodecache.get(node) || Math.random().toString();
    nodecache.set(node, id);
    track.any('box', {id: id, rect: rect});
  };

  var devtoolnode = document.createElement('div');
  document.body.appendChild(devtoolnode);
  reactDom.render(React.createElement( DevTool, null ), devtoolnode);
}

var boxes$ = select.any('box')
  .fold(function (boxes, ref) {
    var id = ref.id;
    var rect = ref.rect;

    var count = 0;
    if (boxes.has(id)) {
      var box = boxes.get(id);
      count = box.count;
    }
    count += 1;
    boxes.set(id, {rect: rect, count: count});
    return boxes
  }, observable())
  .debug('boxes updated');

var state = observable({
  lifeTime: 4000,
  boxes: boxes$
});

var Box = observer(function Box (node) {
  console.log('updating box', node);
  var ref = state.boxes.get(node);
  var count = ref.count;
  var rect = ref.rect;

  return (
    React.createElement( 'div', {
      ref: function (el) { return setTimeout(function () { if (el) { el.style.opacity = 0; } }, state.lifeTime - 500); }, style: {
        display: 'block',
        position: 'fixed',
        zIndex: '150',
        minWidth: '60px',
        outline: '3px solid',
        pointerEvents: 'none',
        transition: 'opacity 500ms ease-in',
        left: rect.left,
        top: rect.y,
        width: rect.width,
        height: rect.height
      } },
      React.createElement( 'span', { style: {
        float: 'right',
        pointerEvents: 'none',
        backgroundColor: 'purple',
        color: 'white'
      } },
        count, "x")
    )
  )
});

var DevTool = observer(function DevTool () {
  return (
    React.createElement( 'div', { id: 'dreno-devtools' },
      state.boxes.forEach(function (ref) {
          var id = ref[0];

          return React.createElement( Box, { id: id });
  }
      )
    )
  )
});

var report = {};

exports.debug = debug;
exports.select = select;
exports.track = track;
exports.observable = observable;
exports.observer = observer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
