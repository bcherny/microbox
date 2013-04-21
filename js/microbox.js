/*global define, require, module */
define(function (require, exports, module) {

	require('lib/_polyfills');

	var _ = require('lib/_util');
	var $ = require('lib/_dom');
	var template = require('lib/_template');

	var D = document;
	var N = navigator;
	var W = window;
	var isIE = N.appName === 'Microsoft Internet Explorer';
	var regexLightbox = /^lightbox/;
	var px = _.toNumber;

	var microBox = (function (opts) {

		// vars
		
		var sets = {};
		var lightboxes = {};
		var options = {
			showPager: true,
			showPagerTitle: true
		};
		var setCount = 0;
		var model = {
			activeSetId: null	
		};

		// set user-defined options
		if (opts) {
			for (var opt in opts) {
				if (options.hasOwnProperty(opt)) {
					options[opt] = opts[opt];
				}
			}
		}

		template.setOptions(options);

		// functions

		function addToSet (setId, item) {
			if (!setContains(setId, item)) {
				sets[setId].push(item);
				build(setId);
			}
		}

		function addSet (setId) {
			sets[setId] = [];
		}

		function addSetNx (setId) {
			if (!setExists(setId)) {
				addSet(setId);
			}
		}

		function getSet (setId) {
			return sets[setId];
		}

		function setContains (setId, item) {
			return sets[setId].indexOf(item) > -1;
		}

		function setExists (setId) {
			return setId in sets;
		}

		function setRendered (setId) {
			return !!$('#microBox-' + setId);
		}

		function getSetIdFromRel (string) {
			var parts = string.split('[');
			return parts.length === 1 ? null : parts[1].slice(0,-1);
		}

		function beforeTransition (oldCur, newCur, callback) {
			oldCur.className = 'abs old';
			newCur.className = 'abs new';
			if (callback) callback();
		}

		function afterTransition (oldCur, newCur) {
			oldCur.className = '';
			newCur.className = 'cur';
		}

		function hideAll () {
			for (var lightbox in lightboxes) {
				hide(lightboxes[lightbox]);
			}
		}

		function hide (element) {
			element.classList.remove('microBox-show');
		}

		function show (element) {
			element.classList.add('microBox-show');
		}

		function jump (element) {

			// get parent
			var parent = _.parent(element, {
				tagName: 'UL'
			});

			// swap slides
			var links = $('a', parent);
			var index = element.innerHTML*1-1;
			var lightbox = parent.parentNode;
			var images = $('img', lightbox);
			var oldCur = $('.cur', lightbox);
			var newCur = images[index];
			var maxHeight = px(getStyle(lightbox).maxHeight);
			var maxWidth = px(getStyle(lightbox).maxWidth);
			var pager;

			if (options.showPager) {
				pager = $('.pager', lightbox);
			}

			// do it
			beforeTransition(oldCur, newCur, function() {

				// compute new styles

				var size = getSize();
				var newHeight = newCur.offsetHeight || maxHeight;
				var newWidth = newCur.offsetWidth || maxWidth;
				var newLeft = (((size.x-newWidth)/2)|1) - 10;
				var newTop = (((size.y-newHeight)/2)|1) - 10;
				var newOpacity = 1;
				
				if (newHeight > maxHeight) {
					newHeight = maxHeight;
				}

				if (newWidth > maxWidth) {
					newWidth = maxWidth;
				}

				// set new styles

				lightbox.style.width = newWidth + 'px';
				lightbox.style.height = newHeight + 'px';
				lightbox.style.left = newLeft + 'px';
				lightbox.style.top = newTop + 'px';

				if (newOpacity) {
					newCur.style.opacity = 1-newOpacity;
				}

				if (pager) {
					pager.style.left = newLeft + 'px';
				}

				// trigger callback

				afterTransition(oldCur, newCur);

			});

			// swap pager styles
			if (element.classList.contains('cur')) {
				var cur = $('.cur', parent);
				if (cur) {
					cur.classList.remove('cur');
				}
				element.classList.add('cur');
			}
		}

		// function setSize () {

		// 	var element = $('.microBox');

		// 	if (element) {

		// 		var style = getStyle(element);
		// 		var windowSize = getSize();
		// 		var xPad = px(style.borderLeftWidth) + px(style.borderRightWidth) + px(style.paddingLeft) + px(style.paddingRight) + px(style.marginLeft) + px(style.marginRight) + 2*px(style.left);
		// 		var yPad = px(style.borderTopWidth) + px(style.borderBottomWidth) + px(style.paddingTop) + px(style.paddingBottom) + px(style.marginTop) + px(style.marginBottom) + 2*px(style.top);

		// 		var height = (windowSize.y-yPad) + 'px';

		// 		setCSS('.microBox', 'height', height);
		// 		setCSS('.microBox', 'maxWidth', (windowSize.x-xPad) + 'px');

		// 	}

		// }

		function build (setId) {

			var images = getSet(setId);
			var html = template.images(setId, images);

			// show pager?
			if (options.showPager) {
				html += template.pager(setId, images);
			}

			// remove the lightbox first if it's already rendered
			if (setRendered(setId)) {
				var element = $('#microBox-' + setId);
				document.body.removeChild(element);
			}

			// inject lightbox
			var box = template.container(setId, html);
			D.body.innerHTML += box;

			// store the reference
			lightboxes[setId] = $('#microBox-' + setId);

		}

		function click (e) {

			var target = e.target;
			var clickedTrigger = _.parent(target, function (element) {
				return element.classList.contains('microBox-trigger');
			});
			var clickedInPager = target.tagName === 'A' && _.parent(target, function (element) {
				return element.classList.contains('pager');
			});
			var clickedInLightbox = _.parent(target, function (element) {
				return element.classList.contains('microBox');
			});

			stop(e);

			if (clickedInPager) {

				stop(e);
				jump(target);
				return;

			}

			// ignore clicks inside the lightbox
			if (clickedInLightbox) {
				return;
			}

			// user clicked on a trigger -> show lightbox
			if (clickedTrigger) {

				stop(e);

				target = clickedTrigger;

				var setId = target.getAttribute('data-lightbox-set');

				// this set is the active set
				if (setId === model.activeSetId) {

					hide(lightboxes[setId]);

				} else {

					// hide other lightboxes
					hideAll();

					// show this lightbox
					show(lightboxes[setId]);

				}

				return;

			}

			// otherwise, hide other lightboxes
			hideAll();

		}

		function init() {

			var togglers = getTogglers();

			// initialize
			togglers.forEach(function (toggler) {

				var href = toggler.href;
				var rel = toggler.rel;
				var setId = getSetIdFromRel(rel);

				// increment set counter
				++setCount;

				// check for set ID
				if (_.isNull(setId)) {
					setId = 'lightbox-' + setCount;
				}

				// prepare DOM for delegated toggling
				toggler.setAttribute('data-lightbox-set', setId);
				toggler.classList.add('microBox-trigger');

				// collect set info
				add(setId, href);
			
			});

		}

		init();

		// attach delegated click event
		document.addEventListener('click', click);

		// public API
		
		/**
		 * Add images to an image set
		 * @param {String}			setId	The set ID
		 * @param {String|Array}	items	URL or array of URLs
		 */
		function add (setId, items) {
			
			// normalize items
			if (_.isString(items)) {
				items = [items];
			}

			// check that the set exists, lazy create if it doesn't
			addSetNx(setId);

			// add
			items.forEach(function (item) {
				addToSet(setId, item);
			});

		}

		return {
			add: add
		};

	})();



	///////////////////////////////////      helpers      ///////////////////////////////////



	function getSize (element) {
		var el = element || (W.innerWidth ? W : D.documentElement);
		return element ? {x: el.offsetWidth, y: el.offsetHeight} : (el.clientWidth ? {x: el.clientWidth, y: el.clientHeight} : {x: el.innerWidth, y: el.innerHeight});
	}

	function getStyle (element) {
		return isIE ? element.currentStyle : getComputedStyle(element);
	}

	function setCSS (selector, property, value) {
		var sheet = document.styleSheets[0];
		var rules = sheet.cssRules || sheet.rules;
		var successFlag = 0;
		console.log('len: ', rules.length);
		rules.forEach(function (rule) {
			if (rule.selectorText === selector) {
				successFlag = 1;
				rule.style[property] = value;
			}
		});
		return successFlag;
	}

	function getTogglers() {
		return _.toArray($('a')).filter(
			function (item) {
				return item.rel.match(regexLightbox);
			}
		);
	}

	function stop (e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	///////////////////////////////////      public API     ///////////////////////////////////
	


	module.exports = microBox;



})