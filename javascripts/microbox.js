var microBox = (function(opts) {

	// polyfills
	if (!('indexOf' in Array.prototype)) {
		Array.prototype.indexOf = function(find, i) {
			if (i === undefined) i = 0;
			if (i < 0) i += this.length;
			if (i < 0) i = 0;
			for (var n = this.length; i<n; i++)
				if (i in this && this[i] === find)
					return i;
			return -1;
		};
	}

	// generic helper functions
	var $$ = function(className, context) {
		var context = context || document;
		if (typeof context.getElementsByClassName === 'function') return context.getElementsByClassName(className);
		className = " " + className + " ";
		var a = [];
		var els = context.getElementsByTagName("*");
		for (var i = 0, j = els.length; i<j; i++) {
			if ((" "+els.item(i).className+" ").indexOf(className) !== -1) a.push(els.item(i));
		}
		return a;
	};
	var px = function(string) {
		return parseInt(string, 10) || 0;
	};
	var getSize = function(element) {
		var el = element || (window.innerWidth ? window : document.documentElement);
		return element ? {x: el.offsetWidth, y: el.offsetHeight} : (el.clientWidth ? {x: el.clientWidth, y: el.clientHeight} : {x: el.innerWidth, y: el.innerHeight});
	};
	var getStyle = function(element) {
		return isIE ? element.currentStyle : getComputedStyle(element);
	};
	var setCSS = function(selector, property, value) {
		var sheet = document.styleSheets[0];
		var rules = sheet.cssRules || sheet.rules;
		var successFlag = 0;
		for (n=rules.length;n--;) {
			if (rules[n].selectorText === selector) {
				successFlag = 1;
				rules[n].style[property] = value;
			}
		}
		return successFlag;
	};

	// vars
	var isIE = navigator.appName === 'Microsoft Internet Explorer';
	var togglers = $$('lightbox');
	var imageSets = {};
	var lightboxes = {};
	var options = {
		showPager: true,
		showPagerTitle: true,
		useAnimation: true
	};

	// set user-defined options
	if (opts) for (opt in opts) {
		if (options.hasOwnProperty(opt)) {
			options[opt] = opts[opt];
		}
	}

	// create animator instance?
	var fx = options.useAnimation ? new Tweenable() : null;

	// functions
	var addToSet = function(set, value) {
		if (!imageSets[set]) imageSets[set] = [];
		if (imageSets[set].indexOf(value) === -1) imageSets[set].push(value);
	};
	var addSet = function(sets) {
		for (set in sets) {
			var images = sets[set];
			for (n=0, c=images.length; n<c; n++) {
				addToSet(set, images[n]);
			}
		}
	};
	var beforeTransition = function(oldCur, newCur, callback) {
		oldCur.className = 'abs old';
		newCur.className = 'abs new';
		if (callback) callback();
	};
	var afterTransition = function(oldCur, newCur) {
		oldCur.className = '';
		newCur.className = 'cur';
	};
	var jumpToSlide = function(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		// get parent
		var parent = this.parentNode;
		while (parent.tagName !== 'UL') {
			parent = parent.parentNode;
		}

		// swap slides
		var links = parent.getElementsByTagName('a');
		var index = this.innerHTML*1-1;
		var lightbox = parent.parentNode;
		var images = lightbox.getElementsByTagName('img');
		var oldCur = $$('cur', lightbox)[0];
		var newCur = images[index];
		var maxWidth = px(getStyle(lightbox).maxWidth);

		if (options.showPager) var pager = $$('pager', lightbox)[0];

		// do it
		if (fx) {
			beforeTransition(oldCur, newCur, function() {

				var oldWidth = px(lightbox.style.width) || 0;
				var newWidth = newCur.offsetWidth || maxWidth;
				if (newWidth > maxWidth) newWidth = maxWidth;
				var oldLeft = lightbox.offsetLeft;
				var newLeft = (((getSize().x-newWidth)/2)|1) - 10;

				fx.tween({
					from: {
						left: oldLeft,
						opacity: 1,
						width: oldWidth
					},
					to: {
						left: newLeft,
						opacity: 0,
						width: newWidth
					},
					step: function() {
						if (o = oldCur.style.opacity) {
							o = this.opacity;
							newCur.style.opacity = 1-this.opacity;
						}
						lightbox.style.width = this.width + 'px';
						lightbox.style.left = this.left + 'px';
						if (pager) pager.style.left = this.left + 'px';
					},
					callback: afterTransition.apply(this, [oldCur, newCur])
				});
			});
		}
		else {
			oldCur.className = oldCur.className.replace('cur', '');
			newCur.className += ' cur';
		}

		// swap pager styles
		if (this.className !== 'cur') {
			var cur = $$('cur', parent);
			if (cur.length) cur[0].className = cur[0].className.replace('cur', '');
			this.className += ' cur';
		}
	};
	var setLightboxSize = function(callback) {
		if (element = $$('microBox')[0]) {
			var style = getStyle(element);
			var windowSize = getSize();
			var xPad = px(style.borderLeftWidth) + px(style.borderRightWidth) + px(style.paddingLeft) + px(style.paddingRight) + px(style.marginLeft) + px(style.marginRight) + 2*px(style.left);
			var yPad = px(style.borderTopWidth) + px(style.borderBottomWidth) + px(style.paddingTop) + px(style.paddingBottom) + px(style.marginTop) + px(style.marginBottom) + 2*px(style.top);

			var height = (windowSize.y-yPad) + 'px';

			setCSS('.microBox', 'height', height);
			setCSS('.microBox', 'maxWidth', (windowSize.x-xPad) + 'px');
			//setCSS('.microBox .inner', 'maxHeight', height);
		}
		if (typeof callback === 'function') callback();
	};
	var buildLightbox = function(set) {
		var element = document.createElement('div');
		element.setAttribute('class', 'microBox');

		// build inner HTML
		var html = ['<div class="inner">'];
		var images = imageSets[set];

		for (n=0, c=images.length; n<c; n++) {
			html.push('<img src="' + images[n] + '" alt="' + set + ' (' + (n+1) + ')' + '"' + (!n ? ' class="cur"' : '') + ' />');
		}
		html.push('</div>');

		// show pager?
		if (options.showPager) {
			html.push('<ul class="pager">');
			if (options.showPagerTitle) html.push('<li class="label">', set, '</li>');
			for (n=0, c=images.length; n<c; n++) {
				var className = (!n && !options.showPagerTitle ? 'first ' : '') + (!n ? 'cur ' : '') + (n === c-1 ? 'last' : '');
				html.push('<li><a href="#" class="' + className + '">' + (n+1) + '</a></li>');
			}
			html.push('</ul>');
		}

		// inject lightbox
		element.innerHTML = html.join('');
		document.body.appendChild(element);

		// add pager events?
		if (options.showPager) {
			var pager = $$('pager', element)[0];
			var items = pager.getElementsByTagName('a');

			for (n=items.length;n--;) {
				addEvent(items[n], 'click', jumpToSlide);
			}
		}

		// set proper lightbox dimensions
		setLightboxSize(function() {
			jumpToSlide.apply($$('pager', element)[0].getElementsByTagName('a')[0]);
		});

		return element;
	};

	var toggleLightbox = function(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		var set = this.imageSet;

		// hide other lightboxes
		doHideLightboxes();
		
		// build the lightbox if it doesn't exist
		if (!lightboxes[set]) {
			lightboxes[set] = buildLightbox(set);
		}
		// show this lightbox
		else lightboxes[set].style.display = 'block';
	};

	var doHideLightboxes = function() {
		for (lightbox in lightboxes) {
			lightboxes[lightbox].style.display = 'none';
		}
	};

	var hideLightboxes = function(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		var outsideFlag = true;
		var i = e.target;

		if (
		    typeof i !== 'undefined'
		 && (tag = i.tagName)
		 && tag !== 'HTML'
		 && tag !== 'BODY'
		) {
			while (i.tagName !== 'BODY') {
				i = i.parentNode;
				if (i.className.indexOf('microBox') !== -1 || i.className.indexOf('lightbox') !== -1) {
					outsideFlag = false;
					break;
				}
			}
		}
		if (outsideFlag) doHideLightboxes();
	};

	// initialize
	for (n=togglers.length;n--;) {
		var toggler = togglers[n];

		// collect set info
		if (set = toggler.getAttribute('data-set')) {
			toggler.imageSet = set;
			addToSet(set, toggler.href);
		}

		// attach click events
		addEvent(toggler, 'click', toggleLightbox);

		// hide lightboxes when clicked off
		addEvent(document.documentElement || window, 'click', hideLightboxes);
	}

	// resize lightbox on window resize
	addEvent(window, 'resize', setLightboxSize);

	// return public methods/vars
	return {
		addImageSet: addSet,
		imageSets: imageSets
	};

})();