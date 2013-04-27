/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	function isFunction (item) {
		return typeof item === 'function';
	}

	function isNull (item) {
		return item === null;
	}

	function isString (item) {
		return typeof item === 'string';
	}

	function isUndefined (item) {
		return typeof item === 'undefined';
	}

	function toArray (item) {
		return [].slice.call(item);
	}


	module.exports = {
		isFunction: isFunction,
		isNull: isNull,
		isString: isString,
		isUndefined: isUndefined,
		toArray: toArray
	};


});