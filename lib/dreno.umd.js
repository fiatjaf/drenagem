(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('xstream')) :
	typeof define === 'function' && define.amd ? define(['exports', 'react', 'xstream'], factory) :
	(factory((global.dreno = global.dreno || {}),global.React,global.xstream));
}(this, (function (exports,react,xs) { 'use strict';

xs = 'default' in xs ? xs['default'] : xs;

var isImplemented = function () {
	var set, iterator, result;
	if (typeof Set !== 'function') { return false; }
	set = new Set(['raz', 'dwa', 'trzy']);
	if (String(set) !== '[object Set]') { return false; }
	if (set.size !== 3) { return false; }
	if (typeof set.add !== 'function') { return false; }
	if (typeof set.clear !== 'function') { return false; }
	if (typeof set.delete !== 'function') { return false; }
	if (typeof set.entries !== 'function') { return false; }
	if (typeof set.forEach !== 'function') { return false; }
	if (typeof set.has !== 'function') { return false; }
	if (typeof set.keys !== 'function') { return false; }
	if (typeof set.values !== 'function') { return false; }

	iterator = set.values();
	result = iterator.next();
	if (result.done !== false) { return false; }
	if (result.value !== 'raz') { return false; }

	return true;
};

var validValue = function (value) {
	if (value == null) { throw new TypeError("Cannot use null or undefined"); }
	return value;
};

var clear = function () {
	validValue(this).length = 0;
	return this;
};

var isImplemented$2 = function () {
	var sign = Math.sign;
	if (typeof sign !== 'function') { return false; }
	return ((sign(10) === 1) && (sign(-20) === -1));
};

var shim = function (value) {
	value = Number(value);
	if (isNaN(value) || (value === 0)) { return value; }
	return (value > 0) ? 1 : -1;
};

var index$1 = isImplemented$2()
	? Math.sign
	: shim;

var abs$1 = Math.abs;
var floor$1 = Math.floor;

var toInteger = function (value) {
	if (isNaN(value)) { return 0; }
	value = Number(value);
	if ((value === 0) || !isFinite(value)) { return value; }
	return index$1(value) * floor$1(abs$1(value));
};

var max = Math.max;

var toPosInteger = function (value) { return max(0, toInteger(value)); };

var indexOf = Array.prototype.indexOf;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var abs = Math.abs;
var floor = Math.floor;

var eIndexOf = function (searchElement/*, fromIndex*/) {
	var this$1 = this;

	var i, l, fromIndex, val;
	if (searchElement === searchElement) { //jslint: ignore
		return indexOf.apply(this, arguments);
	}

	l = toPosInteger(validValue(this).length);
	fromIndex = arguments[1];
	if (isNaN(fromIndex)) { fromIndex = 0; }
	else if (fromIndex >= 0) { fromIndex = floor(fromIndex); }
	else { fromIndex = toPosInteger(this.length) - floor(abs(fromIndex)); }

	for (i = fromIndex; i < l; ++i) {
		if (hasOwnProperty.call(this$1, i)) {
			val = this$1[i];
			if (val !== val) { return i; } //jslint: ignore
		}
	}
	return -1;
};

var create = Object.create;
var getPrototypeOf$1 = Object.getPrototypeOf;
var x = {};

var isImplemented$4 = function (/*customCreate*/) {
	var setPrototypeOf = Object.setPrototypeOf
	  , customCreate = arguments[0] || create;
	if (typeof setPrototypeOf !== 'function') { return false; }
	return getPrototypeOf$1(setPrototypeOf(customCreate(null), x)) === x;
};

var map = { 'function': true, object: true };

var isObject = function (x) {
	return ((x != null) && map[typeof x]) || false;
};

var create$1 = Object.create;
var shim$4;

if (!isImplemented$4()) {
	shim$4 = shim$2;
}

var create_1 = (function () {
	var nullObject, props, desc;
	if (!shim$4) { return create$1; }
	if (shim$4.level !== 1) { return create$1; }

	nullObject = {};
	props = {};
	desc = { configurable: false, enumerable: false, writable: true,
		value: undefined };
	Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
		if (name === '__proto__') {
			props[name] = { configurable: true, enumerable: false, writable: true,
				value: undefined };
			return;
		}
		props[name] = desc;
	});
	Object.defineProperties(nullObject, props);

	Object.defineProperty(shim$4, 'nullPolyfill', { configurable: false,
		enumerable: false, writable: false, value: nullObject });

	return function (prototype, props) {
		return create$1((prototype === null) ? nullObject : prototype, props);
	};
}());

var isPrototypeOf = Object.prototype.isPrototypeOf;
var defineProperty$1 = Object.defineProperty;
var nullDesc = { configurable: true, enumerable: false, writable: true,
		value: undefined };
var validate;

validate = function (obj, prototype) {
	validValue(obj);
	if ((prototype === null) || isObject(prototype)) { return obj; }
	throw new TypeError('Prototype must be null or an object');
};

var shim$2 = (function (status) {
	var fn, set;
	if (!status) { return null; }
	if (status.level === 2) {
		if (status.set) {
			set = status.set;
			fn = function (obj, prototype) {
				set.call(validate(obj, prototype), prototype);
				return obj;
			};
		} else {
			fn = function (obj, prototype) {
				validate(obj, prototype).__proto__ = prototype;
				return obj;
			};
		}
	} else {
		fn = function self(obj, prototype) {
			var isNullBase;
			validate(obj, prototype);
			isNullBase = isPrototypeOf.call(self.nullPolyfill, obj);
			if (isNullBase) { delete self.nullPolyfill.__proto__; }
			if (prototype === null) { prototype = self.nullPolyfill; }
			obj.__proto__ = prototype;
			if (isNullBase) { defineProperty$1(self.nullPolyfill, '__proto__', nullDesc); }
			return obj;
		};
	}
	return Object.defineProperty(fn, 'level', { configurable: false,
		enumerable: false, writable: false, value: status.level });
}((function () {
	var x = Object.create(null), y = {}, set
	  , desc = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');

	if (desc) {
		try {
			set = desc.set; // Opera crashes at this point
			set.call(x, y);
		} catch (ignore) { }
		if (Object.getPrototypeOf(x) === y) { return { set: set, level: 2 }; }
	}

	x.__proto__ = y;
	if (Object.getPrototypeOf(x) === y) { return { level: 2 }; }

	x = {};
	x.__proto__ = y;
	if (Object.getPrototypeOf(x) === y) { return { level: 1 }; }

	return false;
}())));

var index$3 = isImplemented$4()
	? Object.setPrototypeOf
	: shim$2;

var validCallable = function (fn) {
	if (typeof fn !== 'function') { throw new TypeError(fn + " is not a function"); }
	return fn;
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var isImplemented$6 = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') { return false; }
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

var isImplemented$8 = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

var keys = Object.keys;

var shim$7 = function (object) {
	return keys(object == null ? object : Object(object));
};

var index$9 = isImplemented$8()
	? Object.keys
	: shim$7;

var max$1 = Math.max;

var shim$5 = function (dest, src/*, …srcn*/) {
	var arguments$1 = arguments;

	var error, i, l = max$1(arguments.length, 2), assign;
	dest = Object(validValue(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) { error = e; }
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments$1[i];
		index$9(src).forEach(assign);
	}
	if (error !== undefined) { throw error; }
	return dest;
};

var index$7 = isImplemented$6()
	? Object.assign
	: shim$5;

var forEach = Array.prototype.forEach;
var create$2 = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) { obj[key] = src[key]; }
};

var normalizeOptions = function (options/*, …options*/) {
	var result = create$2(null);
	forEach.call(arguments, function (options) {
		if (options == null) { return; }
		process(Object(options), result);
	});
	return result;
};

// Deprecated

var isCallable = function (obj) { return typeof obj === 'function'; };

var str = 'razdwatrzy';

var isImplemented$10 = function () {
	if (typeof str.contains !== 'function') { return false; }
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

var indexOf$1 = String.prototype.indexOf;

var shim$9 = function (searchString/*, position*/) {
	return indexOf$1.call(this, searchString, arguments[1]) > -1;
};

var index$11 = isImplemented$10()
	? String.prototype.contains
	: shim$9;

var index$5 = createCommonjsModule(function (module) {
'use strict';

var d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = index$11.call(dscr, 'c');
		e = index$11.call(dscr, 'e');
		w = index$11.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : index$7(normalizeOptions(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = index$11.call(dscr, 'c');
		e = index$11.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : index$7(normalizeOptions(options), desc);
};
});

var index$13 = createCommonjsModule(function (module, exports) {
'use strict';

var apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	validCallable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) { data[type] = listener; }
	else if (typeof data[type] === 'object') { data[type].push(listener); }
	else { data[type] = [data[type], listener]; }

	return this;
};

once = function (type, listener) {
	var once, self;

	validCallable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	validCallable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) { return this; }
	data = this.__ee__;
	if (!data[type]) { return this; }
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) { data[type] = listeners[i ? 0 : 1]; }
				else { listeners.splice(i, 1); }
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var arguments$1 = arguments;
	var this$1 = this;

	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) { return; }
	listeners = this.__ee__[type];
	if (!listeners) { return; }

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) { args[i - 1] = arguments$1[i]; }

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this$1, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments$1[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: index$5(on),
	once: index$5(once),
	off: index$5(off),
	emit: index$5(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;
});

var validTypes = { object: true, symbol: true };

var isImplemented$12 = function () {
	var symbol;
	if (typeof Symbol !== 'function') { return false; }
	symbol = Symbol('test symbol');
	try { String(symbol); } catch (e) { return false; }

	// Return 'true' also for polyfills
	if (!validTypes[typeof Symbol.iterator]) { return false; }
	if (!validTypes[typeof Symbol.toPrimitive]) { return false; }
	if (!validTypes[typeof Symbol.toStringTag]) { return false; }

	return true;
};

var isSymbol = function (x) {
	if (!x) { return false; }
	if (typeof x === 'symbol') { return true; }
	if (!x.constructor) { return false; }
	if (x.constructor.name !== 'Symbol') { return false; }
	return (x[x.constructor.toStringTag] === 'Symbol');
};

var validateSymbol = function (value) {
	if (!isSymbol(value)) { throw new TypeError(value + " is not a symbol"); }
	return value;
};

var create$3 = Object.create;
var defineProperties = Object.defineProperties;
var defineProperty$2 = Object.defineProperty;
var objPrototype = Object.prototype;
var NativeSymbol;
var SymbolPolyfill;
var HiddenSymbol;
var globalSymbols = create$3(null);
var isNativeSafe;

if (typeof Symbol === 'function') {
	NativeSymbol = Symbol;
	try {
		String(NativeSymbol());
		isNativeSafe = true;
	} catch (ignore) {}
}

var generateName = (function () {
	var created = create$3(null);
	return function (desc) {
		var postfix = 0, name, ie11BugWorkaround;
		while (created[desc + (postfix || '')]) { ++postfix; }
		desc += (postfix || '');
		created[desc] = true;
		name = '@@' + desc;
		defineProperty$2(objPrototype, name, index$5.gs(null, function (value) {
			// For IE11 issue see:
			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
			//    ie11-broken-getters-on-dom-objects
			// https://github.com/medikoo/es6-symbol/issues/12
			if (ie11BugWorkaround) { return; }
			ie11BugWorkaround = true;
			defineProperty$2(this, name, index$5(value));
			ie11BugWorkaround = false;
		}));
		return name;
	};
}());

// Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) { throw new TypeError('Symbol is not a constructor'); }
	return SymbolPolyfill(description);
};

// Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
var polyfill$2 = SymbolPolyfill = function Symbol(description) {
	var symbol;
	if (this instanceof Symbol) { throw new TypeError('Symbol is not a constructor'); }
	if (isNativeSafe) { return NativeSymbol(description); }
	symbol = create$3(HiddenSymbol.prototype);
	description = (description === undefined ? '' : String(description));
	return defineProperties(symbol, {
		__description__: index$5('', description),
		__name__: index$5('', generateName(description))
	});
};
defineProperties(SymbolPolyfill, {
	for: index$5(function (key) {
		if (globalSymbols[key]) { return globalSymbols[key]; }
		return (globalSymbols[key] = SymbolPolyfill(String(key)));
	}),
	keyFor: index$5(function (s) {
		var key;
		validateSymbol(s);
		for (key in globalSymbols) { if (globalSymbols[key] === s) { return key; } }
	}),

	// To ensure proper interoperability with other native functions (e.g. Array.from)
	// fallback to eventual native implementation of given symbol
	hasInstance: index$5('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
	isConcatSpreadable: index$5('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
		SymbolPolyfill('isConcatSpreadable')),
	iterator: index$5('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
	match: index$5('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
	replace: index$5('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
	search: index$5('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
	species: index$5('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
	split: index$5('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
	toPrimitive: index$5('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
	toStringTag: index$5('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
	unscopables: index$5('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
});

// Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype, {
	constructor: index$5(SymbolPolyfill),
	toString: index$5('', function () { return this.__name__; })
});

// Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype, {
	toString: index$5(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
	valueOf: index$5(function () { return validateSymbol(this); })
});
defineProperty$2(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, index$5('', function () {
	var symbol = validateSymbol(this);
	if (typeof symbol === 'symbol') { return symbol; }
	return symbol.toString();
}));
defineProperty$2(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, index$5('c', 'Symbol'));

// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty$2(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	index$5('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

// Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty$2(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	index$5('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

var index$15 = isImplemented$12() ? Symbol : polyfill$2;

var toString = Object.prototype.toString;
var id = toString.call((function () { return arguments; }()));

var isArguments = function (x) { return (toString.call(x) === id); };

var toString$1 = Object.prototype.toString;
var id$1 = toString$1.call('');

var isString = function (x) {
	return (typeof x === 'string') || (x && (typeof x === 'object') &&
		((x instanceof String) || (toString$1.call(x) === id$1))) || false;
};

var iteratorSymbol = index$15.iterator;
var isArray = Array.isArray;

var isIterable = function (value) {
	if (value == null) { return false; }
	if (isArray(value)) { return true; }
	if (isString(value)) { return true; }
	if (isArguments(value)) { return true; }
	return (typeof value[iteratorSymbol] === 'function');
};

var validIterable = function (value) {
	if (!isIterable(value)) { throw new TypeError(value + " is not iterable"); }
	return value;
};

var isImplemented$14 = function () {
	var from = Array.from, arr, result;
	if (typeof from !== 'function') { return false; }
	arr = ['raz', 'dwa'];
	result = from(arr);
	return Boolean(result && (result !== arr) && (result[1] === 'dwa'));
};

var noop = function () {};

var toString$2 = Object.prototype.toString;
var id$2 = toString$2.call(noop);

var isFunction = function (f) {
	return (typeof f === "function") && (toString$2.call(f) === id$2);
};

var iteratorSymbol$2 = index$15.iterator;
var isArray$2 = Array.isArray;
var call$2 = Function.prototype.call;
var desc = { configurable: true, enumerable: true, writable: true, value: null };
var defineProperty$5 = Object.defineProperty;

var shim$11 = function (arrayLike/*, mapFn, thisArg*/) {
	var mapFn = arguments[1], thisArg = arguments[2], Constructor, i, j, arr, l, code, iterator
	  , result, getIterator, value;

	arrayLike = Object(validValue(arrayLike));

	if (mapFn != null) { validCallable(mapFn); }
	if (!this || (this === Array) || !isFunction(this)) {
		// Result: Plain array
		if (!mapFn) {
			if (isArguments(arrayLike)) {
				// Source: Arguments
				l = arrayLike.length;
				if (l !== 1) { return Array.apply(null, arrayLike); }
				arr = new Array(1);
				arr[0] = arrayLike[0];
				return arr;
			}
			if (isArray$2(arrayLike)) {
				// Source: Array
				arr = new Array(l = arrayLike.length);
				for (i = 0; i < l; ++i) { arr[i] = arrayLike[i]; }
				return arr;
			}
		}
		arr = [];
	} else {
		// Result: Non plain array
		Constructor = this;
	}

	if (!isArray$2(arrayLike)) {
		if ((getIterator = arrayLike[iteratorSymbol$2]) !== undefined) {
			// Source: Iterator
			iterator = validCallable(getIterator).call(arrayLike);
			if (Constructor) { arr = new Constructor(); }
			result = iterator.next();
			i = 0;
			while (!result.done) {
				value = mapFn ? call$2.call(mapFn, thisArg, result.value, i) : result.value;
				if (!Constructor) {
					arr[i] = value;
				} else {
					desc.value = value;
					defineProperty$5(arr, i, desc);
				}
				result = iterator.next();
				++i;
			}
			l = i;
		} else if (isString(arrayLike)) {
			// Source: String
			l = arrayLike.length;
			if (Constructor) { arr = new Constructor(); }
			for (i = 0, j = 0; i < l; ++i) {
				value = arrayLike[i];
				if ((i + 1) < l) {
					code = value.charCodeAt(0);
					if ((code >= 0xD800) && (code <= 0xDBFF)) { value += arrayLike[++i]; }
				}
				value = mapFn ? call$2.call(mapFn, thisArg, value, j) : value;
				if (!Constructor) {
					arr[j] = value;
				} else {
					desc.value = value;
					defineProperty$5(arr, j, desc);
				}
				++j;
			}
			l = j;
		}
	}
	if (l === undefined) {
		// Source: array or array-like
		l = toPosInteger(arrayLike.length);
		if (Constructor) { arr = new Constructor(l); }
		for (i = 0; i < l; ++i) {
			value = mapFn ? call$2.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
			if (!Constructor) {
				arr[i] = value;
			} else {
				desc.value = value;
				defineProperty$5(arr, i, desc);
			}
		}
	}
	if (Constructor) {
		desc.value = null;
		arr.length = l;
	}
	return arr;
};

var index$19 = isImplemented$14()
	? Array.from
	: shim$11;

var copy = function (obj/*, propertyNames, options*/) {
	var copy = Object(validValue(obj)), propertyNames = arguments[1], options = Object(arguments[2]);
	if (copy !== obj && !propertyNames) { return copy; }
	var result = {};
	if (propertyNames) {
		index$19(propertyNames, function (propertyName) {
			if (options.ensure || propertyName in obj) { result[propertyName] = obj[propertyName]; }
		});
	} else {
		index$7(result, obj);
	}
	return result;
};

var bind$1 = Function.prototype.bind;
var call$4 = Function.prototype.call;
var keys$2 = Object.keys;
var propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

var _iterate = function (method, defVal) {
	return function (obj, cb/*, thisArg, compareFn*/) {
		var list, thisArg = arguments[2], compareFn = arguments[3];
		obj = Object(validValue(obj));
		validCallable(cb);

		list = keys$2(obj);
		if (compareFn) {
			list.sort((typeof compareFn === 'function') ? bind$1.call(compareFn, obj) : undefined);
		}
		if (typeof method !== 'function') { method = list[method]; }
		return call$4.call(method, list, function (key, index) {
			if (!propertyIsEnumerable.call(obj, key)) { return defVal; }
			return call$4.call(cb, thisArg, obj[key], key, obj, index);
		});
	};
};

var forEach$1 = _iterate('forEach');

var call$3 = Function.prototype.call;

var map$1 = function (obj, cb/*, thisArg*/) {
	var o = {}, thisArg = arguments[2];
	validCallable(cb);
	forEach$1(obj, function (value, key, obj, index) {
		o[key] = call$3.call(cb, thisArg, value, key, obj, index);
	});
	return o;
};

var callable$1         = validCallable;
var bind = Function.prototype.bind;
var defineProperty$4 = Object.defineProperty;
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var define;

define = function (name, desc, options) {
	var value = validValue(desc) && callable$1(desc.value), dgs;
	dgs = copy(desc);
	delete dgs.writable;
	delete dgs.value;
	dgs.get = function () {
		if (!options.overwriteDefinition && hasOwnProperty$1.call(this, name)) { return value; }
		desc.value = bind.call(value, options.resolveContext ? options.resolveContext(this) : this);
		defineProperty$4(this, name, desc);
		return this[name];
	};
	return dgs;
};

var autoBind = function (props/*, options*/) {
	var options = normalizeOptions(arguments[1]);
	if (options.resolveContext != null) { validCallable(options.resolveContext); }
	return map$1(props, function (desc, name) { return define(name, desc, options); });
};

var defineProperty$3 = Object.defineProperty;
var defineProperties$1 = Object.defineProperties;
var Iterator;

var index$17 = Iterator = function (list, context) {
	if (!(this instanceof Iterator)) { return new Iterator(list, context); }
	defineProperties$1(this, {
		__list__: index$5('w', validValue(list)),
		__context__: index$5('w', context),
		__nextIndex__: index$5('w', 0)
	});
	if (!context) { return; }
	validCallable(context.on);
	context.on('_add', this._onAdd);
	context.on('_delete', this._onDelete);
	context.on('_clear', this._onClear);
};

defineProperties$1(Iterator.prototype, index$7({
	constructor: index$5(Iterator),
	_next: index$5(function () {
		var i;
		if (!this.__list__) { return; }
		if (this.__redo__) {
			i = this.__redo__.shift();
			if (i !== undefined) { return i; }
		}
		if (this.__nextIndex__ < this.__list__.length) { return this.__nextIndex__++; }
		this._unBind();
	}),
	next: index$5(function () { return this._createResult(this._next()); }),
	_createResult: index$5(function (i) {
		if (i === undefined) { return { done: true, value: undefined }; }
		return { done: false, value: this._resolve(i) };
	}),
	_resolve: index$5(function (i) { return this.__list__[i]; }),
	_unBind: index$5(function () {
		this.__list__ = null;
		delete this.__redo__;
		if (!this.__context__) { return; }
		this.__context__.off('_add', this._onAdd);
		this.__context__.off('_delete', this._onDelete);
		this.__context__.off('_clear', this._onClear);
		this.__context__ = null;
	}),
	toString: index$5(function () { return '[object Iterator]'; })
}, autoBind({
	_onAdd: index$5(function (index) {
		if (index >= this.__nextIndex__) { return; }
		++this.__nextIndex__;
		if (!this.__redo__) {
			defineProperty$3(this, '__redo__', index$5('c', [index]));
			return;
		}
		this.__redo__.forEach(function (redo, i) {
			if (redo >= index) { this.__redo__[i] = ++redo; }
		}, this);
		this.__redo__.push(index);
	}),
	_onDelete: index$5(function (index) {
		var i;
		if (index >= this.__nextIndex__) { return; }
		--this.__nextIndex__;
		if (!this.__redo__) { return; }
		i = this.__redo__.indexOf(index);
		if (i !== -1) { this.__redo__.splice(i, 1); }
		this.__redo__.forEach(function (redo, i) {
			if (redo > index) { this.__redo__[i] = --redo; }
		}, this);
	}),
	_onClear: index$5(function () {
		if (this.__redo__) { clear.call(this.__redo__); }
		this.__nextIndex__ = 0;
	})
})));

defineProperty$3(Iterator.prototype, index$15.iterator, index$5(function () {
	return this;
}));
defineProperty$3(Iterator.prototype, index$15.toStringTag, index$5('', 'Iterator'));

var array = createCommonjsModule(function (module) {
'use strict';

var defineProperty = Object.defineProperty
  , ArrayIterator;

ArrayIterator = module.exports = function (arr, kind) {
	if (!(this instanceof ArrayIterator)) { return new ArrayIterator(arr, kind); }
	index$17.call(this, arr);
	if (!kind) { kind = 'value'; }
	else if (index$11.call(kind, 'key+value')) { kind = 'key+value'; }
	else if (index$11.call(kind, 'key')) { kind = 'key'; }
	else { kind = 'value'; }
	defineProperty(this, '__kind__', index$5('', kind));
};
if (index$3) { index$3(ArrayIterator, index$17); }

ArrayIterator.prototype = Object.create(index$17.prototype, {
	constructor: index$5(ArrayIterator),
	_resolve: index$5(function (i) {
		if (this.__kind__ === 'value') { return this.__list__[i]; }
		if (this.__kind__ === 'key+value') { return [i, this.__list__[i]]; }
		return i;
	}),
	toString: index$5(function () { return '[object Array Iterator]'; })
});
});

var string = createCommonjsModule(function (module) {
// Thanks @mathiasbynens
// http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols

'use strict';

var defineProperty = Object.defineProperty
  , StringIterator;

StringIterator = module.exports = function (str) {
	if (!(this instanceof StringIterator)) { return new StringIterator(str); }
	str = String(str);
	index$17.call(this, str);
	defineProperty(this, '__length__', index$5('', str.length));

};
if (index$3) { index$3(StringIterator, index$17); }

StringIterator.prototype = Object.create(index$17.prototype, {
	constructor: index$5(StringIterator),
	_next: index$5(function () {
		if (!this.__list__) { return; }
		if (this.__nextIndex__ < this.__length__) { return this.__nextIndex__++; }
		this._unBind();
	}),
	_resolve: index$5(function (i) {
		var char = this.__list__[i], code;
		if (this.__nextIndex__ === this.__length__) { return char; }
		code = char.charCodeAt(0);
		if ((code >= 0xD800) && (code <= 0xDBFF)) { return char + this.__list__[this.__nextIndex__++]; }
		return char;
	}),
	toString: index$5(function () { return '[object String Iterator]'; })
});
});

var iteratorSymbol$1 = index$15.iterator;

var get = function (obj) {
	if (typeof validIterable(obj)[iteratorSymbol$1] === 'function') { return obj[iteratorSymbol$1](); }
	if (isArguments(obj)) { return new array(obj); }
	if (isString(obj)) { return new string(obj); }
	return new array(obj);
};

var isArray$1 = Array.isArray;
var call$1 = Function.prototype.call;
var some = Array.prototype.some;

var forOf = function (iterable, cb/*, thisArg*/) {
	var mode, thisArg = arguments[2], result, doBreak, broken, i, l, char, code;
	if (isArray$1(iterable) || isArguments(iterable)) { mode = 'array'; }
	else if (isString(iterable)) { mode = 'string'; }
	else { iterable = get(iterable); }

	validCallable(cb);
	doBreak = function () { broken = true; };
	if (mode === 'array') {
		some.call(iterable, function (value) {
			call$1.call(cb, thisArg, value, doBreak);
			if (broken) { return true; }
		});
		return;
	}
	if (mode === 'string') {
		l = iterable.length;
		for (i = 0; i < l; ++i) {
			char = iterable[i];
			if ((i + 1) < l) {
				code = char.charCodeAt(0);
				if ((code >= 0xD800) && (code <= 0xDBFF)) { char += iterable[++i]; }
			}
			call$1.call(cb, thisArg, char, doBreak);
			if (broken) { break; }
		}
		return;
	}
	result = iterable.next();

	while (!result.done) {
		call$1.call(cb, thisArg, result.value, doBreak);
		if (broken) { return; }
		result = iterable.next();
	}
};

var iterator$1 = createCommonjsModule(function (module) {
'use strict';

var toStringTagSymbol = index$15.toStringTag

  , defineProperty = Object.defineProperty
  , SetIterator;

SetIterator = module.exports = function (set, kind) {
	if (!(this instanceof SetIterator)) { return new SetIterator(set, kind); }
	index$17.call(this, set.__setData__, set);
	if (!kind) { kind = 'value'; }
	else if (index$11.call(kind, 'key+value')) { kind = 'key+value'; }
	else { kind = 'value'; }
	defineProperty(this, '__kind__', index$5('', kind));
};
if (index$3) { index$3(SetIterator, index$17); }

SetIterator.prototype = Object.create(index$17.prototype, {
	constructor: index$5(SetIterator),
	_resolve: index$5(function (i) {
		if (this.__kind__ === 'value') { return this.__list__[i]; }
		return [this.__list__[i], this.__list__[i]];
	}),
	toString: index$5(function () { return '[object Set Iterator]'; })
});
defineProperty(SetIterator.prototype, toStringTagSymbol, index$5('c', 'Set Iterator'));
});

// Exports true if environment provides native `Set` implementation,
// whatever that is.

var isNativeImplemented = (function () {
	if (typeof Set === 'undefined') { return false; }
	return (Object.prototype.toString.call(Set.prototype) === '[object Set]');
}());

var iterator       = validIterable;
var call = Function.prototype.call;
var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;
var SetPoly;
var getValues;
var NativeSet;

if (isNativeImplemented) { NativeSet = Set; }

var polyfill = SetPoly = function Set(/*iterable*/) {
	var iterable$$1 = arguments[0], self;
	if (!(this instanceof SetPoly)) { throw new TypeError('Constructor requires \'new\''); }
	if (isNativeImplemented && index$3) { self = index$3(new NativeSet(), getPrototypeOf(this)); }
	else { self = this; }
	if (iterable$$1 != null) { iterator(iterable$$1); }
	defineProperty(self, '__setData__', index$5('c', []));
	if (!iterable$$1) { return self; }
	forOf(iterable$$1, function (value) {
		if (eIndexOf.call(this, value) !== -1) { return; }
		this.push(value);
	}, self.__setData__);
	return self;
};

if (isNativeImplemented) {
	if (index$3) { index$3(SetPoly, NativeSet); }
	SetPoly.prototype = Object.create(NativeSet.prototype, { constructor: index$5(SetPoly) });
}

index$13(Object.defineProperties(SetPoly.prototype, {
	add: index$5(function (value) {
		if (this.has(value)) { return this; }
		this.emit('_add', this.__setData__.push(value) - 1, value);
		return this;
	}),
	clear: index$5(function () {
		if (!this.__setData__.length) { return; }
		clear.call(this.__setData__);
		this.emit('_clear');
	}),
	delete: index$5(function (value) {
		var index = eIndexOf.call(this.__setData__, value);
		if (index === -1) { return false; }
		this.__setData__.splice(index, 1);
		this.emit('_delete', index, value);
		return true;
	}),
	entries: index$5(function () { return new iterator$1(this, 'key+value'); }),
	forEach: index$5(function (cb/*, thisArg*/) {
		var this$1 = this;

		var thisArg = arguments[1], iterator, result, value;
		validCallable(cb);
		iterator = this.values();
		result = iterator._next();
		while (result !== undefined) {
			value = iterator._resolve(result);
			call.call(cb, thisArg, value, value, this$1);
			result = iterator._next();
		}
	}),
	has: index$5(function (value) {
		return (eIndexOf.call(this.__setData__, value) !== -1);
	}),
	keys: index$5(getValues = function () { return this.values(); }),
	size: index$5.gs(function () { return this.__setData__.length; }),
	values: index$5(function () { return new iterator$1(this); }),
	toString: index$5(function () { return '[object Set]'; })
}));
defineProperty(SetPoly.prototype, index$15.iterator, index$5(getValues));
defineProperty(SetPoly.prototype, index$15.toStringTag, index$5('c', 'Set'));

var index = isImplemented() ? Set : polyfill;

var tracking = null;

function observable (def) {
  var trackedrefs = {};
  var cachedvalues = {};
  var state = {$: {}};

  Object.keys(def).map(function (attr) {
    if (def[attr].setDebugListener /* is a stream */) {
      trackedrefs[attr] = new index();

      // register property access.
      Object.defineProperty(state, attr, {
        get: function () {
          if (tracking) {
            var rerender = tracking;
            trackedrefs[attr].add(rerender);
          }
          return cachedvalues[attr]
        }
      });

      var stream = def[attr];
      state.$[attr] = stream; // expose the stream because that costs nothing.

      // listen to the stream events to update this state.
      stream.addListener({
        next: function (v) {
          cachedvalues[attr] = v;
          trackedrefs[attr].forEach(function (rerender) {
            rerender();
          });
        },
        error: function (e) { return console.log(("error on stream " + attr + ":"), e); }
      });
    } else /* not a stream, so just store the value */ {
      state[attr] = def[attr];
    }
  });

  return state
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

      wrapped.prototype.render = function render () { return component.call(this, this.props, this.context) };

      return wrapped;
    }(react.Component));
    wrapped.displayName = component.displayName || component.name;
    wrapped.propTypes = component.propTypes;
    wrapped.contextTypes = component.contextTypes;
    wrapped.defaultProps = component.defaultProps;

    return observer(wrapped)
  }

  var name = "<" + (component.displayName ||
             component.prototype && component.prototype.displayName ||
             'unnamed-component') + ">";

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
    tracking = this.rerender;
    console.log(("rendering " + name + " with props " + (JSON.stringify(this.props)) + "."));
    var vdom = baseRender.call(this, this.props, this.context);
    tracking = null;
    return vdom
  };

  return component
}

function rerender () {
  if (this.___isMounted) {
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

var globalEventstream = xs.create();
function track (e) {
  globalEventstream.shamefullySendNext({e: e, element: e.currentTarget});
}
track.preventDefault = function (e) {
  e.preventDefault();
  track(e);
};

track.withValue = function (value) {
  return function (e) {
    globalEventstream.shamefullySendNext({e: e, value: value, element: e.currentTarget});
  }
};
track.preventDefault.withValue = function (value) {
  return function (e) {
    e.preventDefault();
    globalEventstream.shamefullySendNext({e: e, value: value, element: e.currentTarget});
  }
};

var namedEventstreams = {};
track.named = function (name, value) {
  var eventstream = namedEventstreams[name] || xs.create();
  namedEventstreams[name] = eventstream;
  return function (e) {
    eventstream.shamefullySendNext({e: e, value: value, element: e.currentTarget});
  }
};
track.preventDefault.named = function (name, value) {
  var eventstream = namedEventstreams[name] || xs.create();
  namedEventstreams[name] = eventstream;
  return function (e) {
    e.preventDefault();
    eventstream.shamefullySendNext({e: e, value: value, element: e.currentTarget});
  }
};


/* --- select --- */

function select (selector) {
  return {
    events: function events (selectedType) {
      return globalEventstream
        .filter(function (meta) { return matchesSelector(meta.element, selector); }
        )
        .filter(function (meta) { return meta.e.type === selectedType; }
        )
        .map(function (meta) { return meta.value || meta.e; }
        )
    }
  }
}
select.named = function (name) {
  return namedEventstreams[name] || xs.empty()
};

var proto = window.Element.prototype;
var vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
function matchesSelector (elem, selector) {
  return vendor.call(elem, selector)
}

/* --- */

module.exports = {
  track: track,
  select: select
};

exports.observable = observable;
exports.observer = observer;
exports.select = select;
exports.track = track;

Object.defineProperty(exports, '__esModule', { value: true });

})));
