(function(){

	"use strict";

	var regexLightbox = /^lightbox/;

	var _ = {

		extend: function () {

			var obj = arguments[0]
			  , others = arguments.length > 1 ? _.toArray(arguments, 1) : [];

			if (obj && others) {
				for (var i = 0, length = others.length; i < length; i++) {
					for (var key in others[i]) {
						obj[key] = others[i][key];
					}
				}
			}
			return obj;
		},

		toArray: function (thing, index) {

			return [].slice.call(thing, index || 0);

		}

	};

	var options = {
		classes: {
			caption: 'caption',
			captionTrigger: 'microbox-caption-trigger',
			imageCurrent: 'cur',
			lightbox: 'microbox',
			lightboxInner: 'inner',
			lightboxTrigger: 'microbox-trigger',
			showingCaption: 'show-caption',
			showingLightbox: 'show-microbox'
		},
		attrs: {
			lightboxPage: 'data-microbox-page',
			lightboxTrigger: 'data-microbox-trigger'
		},
		ids: {
			lightboxPrefix: 'microbox-'
		}
	};

	// vars
	
	var captions = {};
	var pages = {};
	var sets = {};
	var lightboxes = {};
	var setCount = 0;
	var activeSetId = null;

	// functions

	/**
	 * Helper to add image to set
	 * @param {String} setId	Unique set id
	 * @param {String} item		URL for full sized image to show onClick
	 * @param {String} caption	The image caption (description)
	 * @param {Element} *element
	 */
	function addToSet (setId, item, caption, element) {
		if (!contains(sets[setId], item)) {

			sets[setId].push(item);

			addCaptionNx(setId);

			captions[setId].push(caption);

			if (element) {
				element.setAttribute(options.attrs.lightboxPage, sets[setId].length - 1);
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

		function contains (array, item) {
			return array.indexOf(item) > -1;
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

		// show/hide helpers

		function hideAll () {
			for (var set in sets) {
				hide(set);
			}
			activeSetId = null;
		}

		function hide (setId) {
			getElement(setId).classList.remove(options.classes.showingLightbox);
		}

		function show (setId) {
			getElement(setId).classList.add(options.classes.showingLightbox);
			align(setId);
		}

		//
		
		function getElement (setId) {
			return $('#' + options.ids.lightboxPrefix + setId)[0];
		}

		function setRendered (setId) {
			return !!getElement(setId);
		}

		/**
		 * Vertically aligns a lightbox
		 * @param  {String} setId
		 */
		function align (setId) {
			var box = getElement(setId);
			var img = $('img', box)[0];
			var inner = $('.' + options.classes.lightboxInner, box)[0];
			var height = img.offsetHeight;
			var winHeight = getWindowHeight();
			inner.style['margin-top'] = (winHeight-height)/2 + 'px';
		}

		/**
		 * Builds lightbox into the DOM
		 * @param  {String} setId
		 */
		function build (setId) {

			var captions = getCaptions(setId);
			var images = getSet(setId);
			var html = template.images(setId, images, captions);

			// remove the lightbox first if it's already rendered
			if (setRendered(setId)) {
				var element = getElement(setId);
				document.body.removeChild(element);
			}

			// inject lightbox
			var box = template.container(setId, html);
			document.body.appendChild(box);

			// store the reference
			lightboxes[setId] = getElement(setId);

		}

		/**
		 * Delegated click handler
		 * @param  {Event} e The click event
		 */
		function click (e) {

			var events = {

				// hide other lightboxes
				document: {
					fn: function () {
						hideAll();
					},
					yep: function () {
						var classes = options.classes;
						var classList = e.target.classList;
						return !classList.contains(classes.captionTrigger) && !classList.contains(classes.caption);
					}
				},

				caption: {
					fn: function () {

						var classes = options.classes;
						var class_showingCaption = classes.showingCaption;
						var target = e.target;

						// toggle box class
						var box = parent(target, function (element) {
							return element.classList.contains(classes.lightbox);
						});
						box.classList.toggle(class_showingCaption);

						// toggle caption
						var caption = target.parentNode;
						var height = caption.offsetHeight;
						var winHeight = getWindowHeight();

						caption.style.top = (
							box.classList.contains(class_showingCaption) ?
							(winHeight - height) :
							winHeight
						) + 'px';

					},
					yep: function () {
						return e.target.classList.contains(options.classes.captionTrigger);
					}
				},

				// user clicked on a trigger -> show lightbox
				trigger: {
					fn: function () {
						stop(e);

						var target = this.yep();
						var setId = target.getAttribute(options.attrs.lightboxTrigger);

						// this set is the active set
						if (setId === activeSetId) {

							// update model
							activeSetId = null;

							// hide this lightbox
							hide(setId);

						} else {

							// hide other lightboxes
							hideAll();

							// update model
							activeSetId = setId;

							// show this lightbox
							show(setId);
						}

						return;
					},
					yep: function () {
						return parent(e.target, function (element) {
							return element.classList.contains(options.classes.lightboxTrigger);
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

		}

		/**
		 * Resize event handler
		 */
		function resize() {
			var setId = activeSetId;
			if (!_.isUndefined(setId) && !_.isNull(setId)) {
				align(setId);
			}
		}

		/**
		 * Initialize based on what's currently in the DOM
		 */
		function init() {

			var togglers = getTogglers();

			// initialize
			togglers.forEach(function (toggler) {

				var href = toggler.href;
				var setId = options.ids.lightboxPrefix + setCount;
				var title = toggler.title;

				// increment set counter
				++setCount;

				// prepare DOM for delegated toggling
				toggler.setAttribute(options.attrs.lightboxTrigger, setId);
				toggler.classList.add(options.classes.lightboxTrigger);

				// collect set info
				add(setId, href, title, toggler);
			
			});

		}

		init();

		// attach events
		document.addEventListener('click', click);
		window.addEventListener('resize', resize);
		
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

	function getWindowHeight() {
		return window.innerHeight || document.body.clientHeight;
	}

	/**
	 * Get element's parent
	 * @param  {DOMElement} element	The element to start iterating on
	 * @param  {Function|Object} filter	A filter function (eg. function (el) { return el.href })) or hash (eg. {tagName: 'A'})
	 * @return {DOMElement|null}
	 */
	function parent (element, filter) {

		if (_.isFunction(filter)) {

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
			return _.isUndefined(element.documentElement) && element.tagName !== 'HTML';
		}

		return false;

	}

})();