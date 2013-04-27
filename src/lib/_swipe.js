define(function (require, exports, module) {


	'use strict';

	var _ = require('lib/_util');
	var threshold = 10;

	function detectSwipe (direction, element, callback) {

		var el = element || document;
		var secondaryEventsAreSet = 0;
		var starting = {};

		el.addEventListener(_.e.down, down);

		function down (e) {

			e.preventDefault();

			var x = e.pageX || e.targetTouches[0].pageX;
			var y = e.pageY || e.targetTouches[0].pageY;

			starting = {
				x: x,
				y: y
			};

			if (!secondaryEventsAreSet) {
				addListeners();
			}

		}

		function up (e) {

			var x = e.pageX || e.targetTouches[0].pageX;
			var y = e.pageY || e.targetTouches[0].pageY;

			if (distance(starting.x, starting.y, x, y) > threshold) {

				e.preventDefault();
				e.stopPropagation();
			
				console.log('up: ', x, y);
				var dirs = getDirection(starting.x, starting.y, x, y);
				removeListeners();

				if (dirs.indexOf(direction) > -1) {
					callback(x, y, e, el, direction);
				}
			}
		}

		function move (e) {

			var x = e.pageX || e.targetTouches[0].pageX;
			var y = e.pageY || e.targetTouches[0].pageY;

		}

		function addListeners () {
			el.addEventListener(_.e.move, move);
			el.addEventListener(_.e.up, up);
			secondaryEventsAreSet = 1;
		}

		function removeListeners () {
			el.removeEventListener(_.e.move, move);
			el.removeEventListener(_.e.up, up);
			secondaryEventsAreSet = 0;
		}

	}

	function getDirection (x0, y0, x1, y1) {

		var dirs = [];
		
		if (Math.abs(x1 - x0) > threshold) {
			dirs.push( x1 > x0 ? 'right' : 'left');
		}

		if (Math.abs(y1 - y0) > threshold) {
			dirs.push( y1 > y0 ? 'down' : 'up');
		}

		return dirs;

	}

	function distance (x0, y0, x1, y1) {
		return Math.sqrt((x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0));
	}

	// public API

	var swipe = {
		down: function (element, callback) {
			return detectSwipe('down', element, callback);
		},
		left: function (element, callback) {
			return detectSwipe('left', element, callback);
		},
		right: function (element, callback) {
			return detectSwipe('right', element, callback);
		},
		up: function (element, callback) {
			return detectSwipe('up', element, callback);
		}
	};

	module.exports = swipe;

});