/*global define, require, module */
define(function (require, exports, module) {

	require('lib/_polyfills');

	var _ = require('lib/_util');
	var $ = require('lib/_dom');
	var template = require('lib/_template');

	var D = document;
	var regexLightbox = /^lightbox/;

	function MicroBox (opts) {

		// vars
		
		var captions = {};
		var pages = {};
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

		/**
		 * Helper to add image to set
		 * @param {String} setId	Unique set id
		 * @param {String} item		URL for full sized image to show onClick
		 * @param {String} caption	The image caption (description)
		 * @param {Element} *element
		 */
		function addToSet (setId, item, caption, element) {
			if (!setContains(setId, item)) {
				sets[setId].push(item);

				addCaptionNx(setId);

				captions[setId].push(caption);

				if (element) {
					element.setAttribute('data-microbox-page', sets[setId].length - 1);
				}

				build(setId);
			}
		}

		// set helpers

		function addSet (setId) {
			pages[setId] = 0;
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

		// caption helpers

		function addCaption (setId) {
			captions[setId] = [];
		}

		function addCaptionNx (setId) {
			if (!captionExists(setId)) {
				addCaption(setId);
			}
		}

		function captionExists (setId) {
			return setId in captions;
		}

		function getCaptions (setId) {
			return captions[setId];
		}

		//

		function hideAll () {
			for (var set in sets) {
				hide(set);
			}
			model.activeSetId = null;
		}

		function build (setId) {

			var captions = getCaptions(setId);
			var images = getSet(setId);
			var html = template.images(setId, images, captions);

			// remove the lightbox first if it's already rendered
			if (setRendered(setId)) {
				var element = $('#microbox-' + setId);
				document.body.removeChild(element);
			}

			// inject lightbox
			var box = template.container(setId, html);
			D.body.appendChild(box);

			// store the reference
			lightboxes[setId] = $('#microbox-' + setId);

		}

		function click (e) {

			var events = {

				// hide other lightboxes
				document: {
					fn: function () {
						hideAll();
					},
					yep: function () {
						return e.target.classList.contains('microbox');
					}
				},

				image: {
					fn: function () {

						// var img = e.target;
						// var isZoomed = img.style.height;

						// // create a dummy image that we can measure
						// var full = new Image();
						// full.src = img.src;

						// // get full image height
						// var height = full.height;
						// var width = full.width;
						// var style = img.style;

						// // zoom!
						// if (isZoomed) {
						// 	style.cssText = '';
						// } else {
						// 	style.height = height + 'px';
						// 	style['max-width'] = width + 'px';
						// }

					},
					yep: function () {
						return e.target.classList.contains('cur');
					}
				},

				// user clicked on a trigger -> show lightbox
				trigger: {
					fn: function () {
						stop(e);

						var target = this.yep();
						var setId = target.getAttribute('data-microbox-trigger');

						// this set is the active set
						if (setId === model.activeSetId) {

							// update model
							model.activeSetId = null;

							// hide this lightbox
							hide(setId);

						} else {

							// hide other lightboxes
							hideAll();

							// update model
							model.activeSetId = setId;

							// show this lightbox
							show(setId);
						}

						return;
					},
					yep: function () {
						return _.parent(e.target, function (element) {
							return element.classList.contains('microbox-trigger');
						});
					}
				}
			};
			
			// trigger events
			for (var evt in events) {
				var candidate = events[evt];
				if (candidate.yep()) {
					candidate.fn();
				}
			}

			// update model
			model.activeSetId = null;

		}

		function resize() {
			var setId = model.activeSetId;

			if (!setId) {
				return;
			}

			// TODO - trigger CSS to resize image (won't update in chrome!!!)

		}

		function init() {

			var togglers = getTogglers();

			// initialize
			togglers.forEach(function (toggler) {

				var href = toggler.href;
				var setId = 'microbox-' + setCount;
				var title = toggler.title;

				// increment set counter
				++setCount;

				// prepare DOM for delegated toggling
				toggler.setAttribute('data-microbox-trigger', setId);
				toggler.classList.add('microbox-trigger');

				// collect set info
				add(setId, href, title, toggler);
			
			});

		}

		init();

		// attach delegated click event
		document.addEventListener('click', click);
		window.addEventListener('resize', resize);

		// public API
		
		/**
		 * Add images to an image set
		 * @param {String}			setId		The set ID
		 * @param {String|Array}	items		URL or array of URLs
		 * @param {String|Array}	captions	caption or array of captions
		 * @param {DOMElement}		*element
		 */
		function add (setId, items, captions, element) {
			
			// normalize items
			if (_.isString(items)) {
				items = [items];
			}

			// normalize captions
			if (_.isString(captions)) {
				captions = [captions];
			}

			// check that the set exists, lazy create if it doesn't
			addSetNx(setId);

			// add
			items.forEach(function (item, n) {
				addToSet(setId, item, captions[n], element);
			});

		}

		return {
			add: add
		};

	}



	///////////////////////////////////      helpers      ///////////////////////////////////



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

	function hide (setId) {
		$('#microbox-' + setId).classList.remove('microbox-show');
	}

	function show (setId) {
		$('#microbox-' + setId).classList.add('microbox-show');
	}

	function setRendered (setId) {
		return !!$('#microbox-' + setId);
	}



	///////////////////////////////////      public API     ///////////////////////////////////
	


	module.exports = MicroBox;



});