/*global define, require, module */
define(function (require, exports, module) {

	require('lib/_polyfills');

	var _ = require('lib/_util');
	var $ = require('lib/_dom');
	var template = require('lib/_template');

	var D = document;
	var W = window;
	var regexLightbox = /^lightbox/;

	function Microbox (opts) {

		// default options

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
			D.body.appendChild(box);

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
						var box = _.parent(target, function (element) {
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
						return _.parent(e.target, function (element) {
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
			if (_.isDefined(setId) && !_.isNull(setId)) {
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
		D.addEventListener('click', click);
		W.addEventListener('resize', resize);
		
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
		return W.innerHeight || D.body.clientHeight;
	}



	///////////////////////////////////      public API     ///////////////////////////////////
	


	module.exports = Microbox;



});