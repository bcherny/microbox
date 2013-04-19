var isIE = navigator.appName === 'Microsoft Internet Explorer';

function styleScrollbar(container) {

	var inner = container.getElementsByClassName('inner')[0];

	var oldHeight = inner.style.maxHeight;
	var oldOverflow = container.style.overflow;
	inner.style.maxHeight = '';
	container.style.overflow = 'auto';

	var visibleHeight = container.offsetHeight;
	var fullHeight = container.scrollHeight;

	console.log(
		'offset: ', container.offsetHeight,
		', scroll: ', container.scrollHeight,
		', client: ', container.clientHeight
	);

	//inner.style.maxHeight = oldHeight;
	//container.style.overflow = oldOverflow;

	// add scroller?
	if (fullHeight > visibleHeight) {

		container.className += ' scrollable';

		// build the scroller
		var scroller = injectScroller(container, visibleHeight, fullHeight);
		
		// size the inner container
		
		var style = getStyle(container);
		var maxHeight = style.maxHeight;
		var height = style.height;
		//inner.style.maxHeight = maxHeight === 'none' ? (height ? height : container.offsetHeight + 'px') : maxHeight;

		// replace the native scroll bar with our styled one
		inner.scrollBar = initScroller(scroller, inner, visibleHeight);
		inner.fullHeight = fullHeight;
		scroller.height = scroller.offsetHeight;

		// scroll the scrollBar when using the mousewheel
		bean.add(inner, 'scroll touchmove', function() {
			this.scrollBar.move(null, this.scrollTop*(visibleHeight - this.scrollBar.element.height)/(this.fullHeight - visibleHeight));
		});
	}
}

function initScroller(scroller, inner, visibleHeight) {
	var draggable = scroller.drag = new Drag(scroller, {
		direction: {
			x: 0,
			y: 1
		},
		limit: {
			y: [0, visibleHeight]
		},
		onDragStart: function(element) {
			inner.className = 'inner set';
			element.className += ' active';
		},
		onDrag: function(element, X, Y) {
			inner.scrollTop = (inner.fullHeight - visibleHeight)*Y/(visibleHeight - scroller.height);
		},
		onDragEnd: function(element) {
			element.className = 'scroller';
		}
	});
	return draggable;
}

function injectScroller(container, offsetHeight, scrollHeight) {
	console.log('injecting');
	var scroller = document.createElement('a');
	scroller.setAttribute('href', '#');
	scroller.setAttribute('class', 'scroller');
	sizeScroller(scroller, offsetHeight, scrollHeight);
	container.appendChild(scroller);
	return scroller;
}

function sizeScroller(scroller, offsetHeight, scrollHeight) {
	scroller.style.height = (h=((offsetHeight*offsetHeight/scrollHeight)|1)) + 'px';
	return h;
}

function getStyle(element) {
	return isIE ? element.currentStyle : getComputedStyle(element);
}