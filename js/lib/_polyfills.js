/*global define, require, module */
define(function (require, exports, module) {


	'use strict';

	
	var D = document;
	var W = window;
	var Array_proto = Array.prototype;
	var Element_proto = Element.prototype;


	//
	// Element.classList
	//


	var regex = ['(^|\\s)', '(?:\\s|$)'];

	if (!Element_proto.classList) {

		Element_proto.classList = {
			add: function (className) {
				this.className += ' ' + className;
				return this;
			},
			contains: function (className) {
				return this.className.indexOf(className) > -1;
			},
			remove: function (className) {
				var self = this;
				self.className = self.className.replace(new RegExp(regex[0] + className + regex[1]), '$1');
				return self;
			}
		};

	}


	//
	// Element.addEventListener
	//


	if (!D.addEventListener) {

		D.addEventListener =
		W.addEventListener =
		Element_proto = function (type, callback) {
			this.attachEvent('on'+type, callback);
		};

	}


	//
	// Array.forEach
	//
	

	if (![].forEach) {

		Array_proto.forEach = function (callback, self) {
			var scope = self || this;
			for (var n = 0, nn = this.length; n < nn; ++n) {
				callback.call(scope, this[n], n, this);
			}
		};

	}


	//
	// Array.filter
	// @source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/filter
	//


	if (![].filter) {

		Array_proto.filter = function (fun /*, thisp */) {

			if (this === null) {
				throw new TypeError();
			}

			var t = Object(this);
			var len = t.length >>> 0;

			if (typeof fun !== 'function') {
				throw new TypeError();
			}

			var res = [];
			var thisp = arguments[1];

			for (var i = 0; i < len; i++) {
				if (i in t) {
					var val = t[i]; // in case fun mutates this
					if (fun.call(thisp, val, i, t)) {
						res.push(val);
					}
				}
			}

			return res;
		};

	}


	//
	// Array.indexOf
	//


	if (![].indexOf) {

		Array_proto.indexOf = function (item) {

			if (this === null) {
				throw new TypeError();
			}

			for (var n = this.length; n--;) {
				if (item === this[n]) {
					return n;
				}
			}
			return -1;

		};

	}
});