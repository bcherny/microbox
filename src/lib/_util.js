var _ = (function(){


	'use strict';


	var _ = {
		isFunction: function (item) {
			return typeof item === 'function';
		},
		isNull: function (item) {
			return item === null;
		},
		isString: function (item) {
			return typeof item === 'string';
		},
		isUndefined: function (item) {
			return typeof item === 'undefined';
		},
		toArray: function (items) {
			return [].slice.call(items);
		}
	};


	return _;


})();