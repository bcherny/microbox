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

			} while (element.offsetParent);

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

			} while (element.offsetParent);

		}

		return null;

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


	module.exports = {
		isArray: isArray,
		isDefined: isDefined,
		isFunction: isFunction,
		isNumber: isNumber,
		isNull: isNull,
		isString: isString,
		isObject: isObject,
		parent: parent,
		toArray: toArray,
		toNumber: toNumber,
		toString: toString
	};


});