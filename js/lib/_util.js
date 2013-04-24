/*global define, require, module */
define(function (require, exports, module) {


	'use strict';

	function isArray (item) {
		return !isString(item) && 'length' in item;
	}

	function isDefined (item) {
		return typeof item !== 'undefined';
	}

	function isFunction (item) {
		return typeof item === 'function';
	}

	function isNumber (item) {
		return typeof item === 'number';
	}

	function isNull (item) {
		return item === null;
	}

	function isObject (item) {
		return !isArray(item) && !isFunction(item) && !isNumber(item) && !isString(item);
	}

	function isString (item) {
		return typeof item === 'string';
	}

	function one (obj) {
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				return i;
			}
		}
	}

	/**
	 * Get element's parent
	 * @param  {DOMElement} element	The element to start iterating on
	 * @param  {Function|Object} filter	A filter function (eg. function (el) { return el.href })) or hash (eg. {tagName: 'A'})
	 * @return {DOMElement|null}
	 */
	function parent (element, filter) {

		if (isFunction(filter)) {

			do {

				if (filter(element)) {
					return element;
				}

				element = element.parentNode;

			} while (_continue(element));

		} else {

			do {

				var good = 0, count = 0;

				for (var property in filter) {
					if (filter[property] == element[property]) {
						++good;
					}
					++count;
				}

				if (good === count) {
					return element;
				}

				element = element.parentNode;

			} while (_continue(element));

		}

		function _continue (element) {
			return !isDefined(element.documentElement) && element.tagName !== 'HTML';
		}

		return false;

	}

	function toArray (item) {
		return [].slice.call(item);
	}

	function toNumber (item) {
		return parseInt(item, 10);
	}

	function toString (item) {
		return item + '';
	}

	// see http://stackoverflow.com/a/4819886
	// and http://blog.stevelydford.com/2012/03/detecting-touch-hardware-in-ie-10/
	var isWebkitTouchDevice = !!('ontouchstart' in window);
	var isMsTouchDevice = !!('msMaxTouchPoints' in navigator);

	var events = isWebkitTouchDevice ? {
		down: 'touchstart',
		move: 'touchmove',
		up: 'touchend'
	} : (
		isMsTouchDevice ? {
			down: 'MSPointerDown',
			move: 'MSPointerMove',
			up: 'MSPointerUp'
		} : {
			down: 'mousedown',
			move: 'mousemove',
			up: 'mouseup'
		}
	);

	module.exports = {
		e: events,
		isArray: isArray,
		isDefined: isDefined,
		isFunction: isFunction,
		isNumber: isNumber,
		isNull: isNull,
		isString: isString,
		isObject: isObject,
		isTouchDevice: isWebkitTouchDevice || isMsTouchDevice,
		one: one,
		parent: parent,
		toArray: toArray,
		toNumber: toNumber,
		toString: toString
	};


});