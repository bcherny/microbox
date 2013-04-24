/*global define, require, module */
define(function (require, exports, module) {

	require('lib/_polyfills');

	var _ = require('lib/_util');
	var $ = require('lib/_dom');
	var swipe = require('lib/_swipe');
	var template = require('lib/_template');

	var D = document;
	var regexLightbox = /^lightbox/;

	function MicroBox (opts) {

		// vars
		
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
		 * @param {String} item		URL for full sized image to hsow onClick
		 * @param {Element} *element
		 */
		function addToSet (setId, item, element) {
			if (!setContains(setId, item)) {
				sets[setId].push(item);

				if (element) {
					element.setAttribute('data-microbox-page', sets[setId].length - 1);
				}

				build(setId);
			}
		}

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

		function hideAll () {
			for (var set in sets) {
				hide(set);
			}
			model.activeSetId = null;
		}

		/**
		 * Jump to a slide
		 * @param  {String} *setId		// defaults to first set (often unpredictable because some browsers sort object keys!)
		 * @param  {Number} *pageId		// defaults to increment
		 */
		function jump (setId, pageId) {

			// normalize setId
			if (_.isNull(setId)) {
				setId = _.one(sets);
			}

			var pageCurrentId = pages[setId];

			// normalize pageId
			if (_.isNull(pageId) || !_.isDefined(pageId)) {
				pageId = pageCurrentId + 1;
			}

			// which images shall we animate?
			var lightbox = $('#microbox-' + setId);
			var images = $('img', lightbox);
			var imgNew = images[pageId];
			var imgOld = images[pageCurrentId];

			// dooit
			imgOld.classList.remove('cur');
			imgNew.classList.add('cur');

			// de-activate old pager cell
			var pager = $('.microbox-pager', lightbox)[0];
			var cur = $('.cur', pager);

			if (cur[0]) {
				cur[0].classList.remove('cur');
			}

			// activate new pager cell
			_.toArray($('td', pager)).forEach(function (item) {
				if (item.getAttribute('data-microbox-page') === pageId) {
					item.classList.add('cur');
					return;
				}
			});

			// update model
			pages[setId] = pageId;

		}

		function jumpDir (direction, e) {

			var box = _.parent(e.target, function (element) {
				return element.classList.contains('microbox');
			});

			if (!box) {
				return false;
			}

			var setId = box.id.slice(9);

			if (setId) {

				var pageId = +pages[setId];
				var lightbox = $('#microbox-' + setId);
				var images = $('img', lightbox);
				var pageMax = images.length - 1;

				if (direction === 'right') {
					++pageId;
					if (pageId > pageMax) {
						pageId = pageMax;
					}
				} else {
					--pageId;
					if (pageId < 0) {
						pageId = 0;
					}
				}

				console.log('jump: ', setId, pageId);

				jump(setId, pageId);

			}

		}

		function jumpLeft (x, y, e) {
			jumpDir('left', e);
		}

		function jumpRight (x, y, e) {
			jumpDir('right', e);
		}

		function build (setId) {

			var images = getSet(setId);
			var html = template.images(setId, images);
			var showPager = options.showPager;

			// show pager?
			if (showPager) {
				html += template.pager(setId, images);
			}

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

			// if there's a pager, select the first item
			if (showPager) {

				var item = $('td', lightboxes[setId])[1];

				if (item) {
					item.classList.add('cur');
				}

			}

			// activate the first image
			jump(setId, 0);

		}

		function click (e) {

			var events = {

				// hide other lightboxes
				document: {
					fn: function () {
						hideAll();
					},
					yep: function () {
						return !_.parent(e.target, function (element) {
							var classList = element.classList;
							return classList && classList.contains('microbox');
						});
					}
				},

				image: {
					fn: function () {

						var img = e.target;
						var isZoomed = img.style.height;

						// create a dummy image that we can measure
						var full = new Image();
						full.src = img.src;

						// get full image height
						var height = full.height;
						var width = full.width;
						var style = img.style;

						// zoom!
						if (isZoomed) {
							style.cssText = '';
						} else {
							style.height = height + 'px';
							style['max-width'] = width + 'px';
						}

					},
					yep: function () {
						return e.target.tagName === 'IMG';
					}
				},

				pager: {
					fn: function () {
						stop(e);

						var target = e.target;
						var pageId = target.getAttribute('data-microbox-page');
						var setId = target.getAttribute('data-microbox-srt');

						jump(setId, pageId);

						return;
					},
					yep: function () {
						return _.parent(e.target, function (element) {
							return !_.isNull(element.getAttribute('data-microbox-set'));
						});
					}
				},

				// user clicked on a trigger -> show lightbox
				trigger: {
					fn: function () {
						stop(e);

						var target = this.yep();
						var setId = target.getAttribute('data-microbox-trigger');
						var pageId = target.getAttribute('data-microbox-page') || 0;

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

							// page it
							jump(setId, pageId);
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
					setId = 'microbox-' + setCount;
				}

				// prepare DOM for delegated toggling
				toggler.setAttribute('data-microbox-trigger', setId);
				toggler.classList.add('microbox-trigger');

				// collect set info
				add(setId, href, toggler);
			
			});

		}

		init();

		// attach delegated click event
		document.addEventListener('click', click);

		// attach swipe events
		swipe.left(null, jumpLeft);
		swipe.right(null, jumpRight);

		// public API
		
		/**
		 * Add images to an image set
		 * @param {String}			setId	The set ID
		 * @param {String|Array}	items	URL or array of URLs
		 * @param {DOMElement}		*element
		 */
		function add (setId, items, element) {
			
			// normalize items
			if (_.isString(items)) {
				items = [items];
			}

			// check that the set exists, lazy create if it doesn't
			addSetNx(setId);

			// add
			items.forEach(function (item) {
				addToSet(setId, item, element);
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

	function getSetIdFromRel (string) {
		var parts = string.split('[');
		return parts.length === 1 ? null : parts[1].slice(0,-1);
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