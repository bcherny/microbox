function Drag(element, opts) {

	// options
	this.options = {
		// update styles?
		setCursor: false,
		setPosition: false,

		// x: true/false, y: true/false
		direction: {
			x: true,
			y: true
		},

		// x: [minimum position, maximum position], y: [minimum position, maximum position]
		limit: {
			x: null,
			y: null
		},

		// function(element, X position, Y position, event)
		onDrag: null,

		// function(element, X position, Y position, event)
		onDragStart: null,

		// function(element, X position, Y position, event)
		onDragEnd: null
	};

	var options = this.options;

	// set user-defined options
	
	for (opt in opts) {
		if (options.hasOwnProperty(opt)) {
			options[opt] = opts[opt];
		}
	}

	// internal vars

	this.element = element;
	this.X;
	this.Y;
	var cursorOffsetX, cursorOffsetY, scrollBarHeight, scrollBarWidth;
	var self = this;

	this.move = function(x ,y) {

		var style = this.element.style;
		var direction = options.direction;
		var limit = options.limit;

		if (direction.x) {
			var lowIsOk  = x > limit.x[0],
				highIsOk = x + scrollBarWidth <= limit.x[1];
			self.X = x;
			style.left =
				limit.x === null || (lowIsOk && highIsOk)
				? x + 'px'
				: (!lowIsOk ? 0 : (limit.x[1]-scrollBarWidth) + 'px');
		}
		if (direction.y) {
			var lowIsOk  = y > limit.y[0],
				highIsOk = y + scrollBarHeight <= limit.y[1];
			self.Y = y;
			style.top =
				limit.y === null || (lowIsOk && highIsOk)
				? y + 'px'
				: (!lowIsOk ? 0 : (limit.y[1]-scrollBarHeight) + 'px');
		}
	};

	this.setScrollBarSize = function(width, height) {
		if (width) scrollBarWidth = width;
		if (height) scrollBarHeight = height;
	};
	
	var init = function() {

		// set the element
		var element = self.element;
		if (!element) throw new Error('Invalid element passed to draggable: ' + element);

		// position the scrollbar
		var parent = element.parentNode;
		var style = element.style;
		style.left = (parent.offsetWidth - element.offsetWidth) + 'px';
		style.top = 0;

		// get scroll bar dimensions
		var compStyle = getStyle(element);
		self.setScrollBarSize(nopx(compStyle.width), nopx(compStyle.height));

		// optional styling
		if (options.setPosition) {
			style.right = 'auto';
			style.bottom = 'auto';
			style.position = 'absolute';
		}
		if (options.setCursor) style.cursor = 'move';

		// attach mousedown event
		bean.add(element, 'mousedown', start);
	};

	var start = function(e) {
		// prevent browsers from visually dragging the element's outline
		e.preventDefault();

		// set a high z-index, just in case
		var element = self.element;
		element.oldZindex = element.style.zIndex;
		element.style.zIndex = 10000;

		// set initial position
		var initialPosition = getInitialPosition(element);
		cursorOffsetX = (self.X=initialPosition.x) - e.clientX;
		cursorOffsetY = (self.Y=initialPosition.y) - e.clientY;

		// add event listeners
		bean.add(document, {
			select: preventDefault,
			mousemove: drag,
			mouseup: stop
		});

		// trigger start event
		if (f=options.onDragStart) f(element, self.X, self.Y, e);
	};

	var drag = function(e) {
		// compute new coordinates
		var x = e.clientX + cursorOffsetX;
		var y = e.clientY + cursorOffsetY;

		// move the element
		self.move(x, y);

		// trigger drag event
		if (f=options.onDrag) f(self.element, x, y, e);
	};

	var stop = function(e) {
		// remove events
		bean.remove(document, 'select mousemove mouseup');

		// resent element's z-index
		self.element.style.zIndex = self.element.oldZindex;

		// trigger dragend event
		if (f=options.onDragEnd) f(self.element, self.X, self.Y, e);
	};

	var getInitialPosition = function(element) {

		var top = 0;
		var left = 0;
		var i = element;

		// compute element offset relative to the window
		do {
			top += i.offsetTop;
			left +=  i.offsetLeft;
		} while (i = i.offsetParent && !getStyle(i.parentNode).position);

		// subtract margin and border widths
		if (style = getStyle(element)) {
			left -= (nopx(style['marginLeft']) || 0) - (nopx(style['borderLeftWidth']) || 0);
			top -= (nopx(style['marginTop']) || 0) - (nopx(style['borderTopWidth']) || 0);
		}

		return {x: left, y: top};
	};

	var preventDefault = function(e) {
		e.preventDefault();
	};

	var nopx = function(string) {
		return parseInt(string, 10);
	};

	init();
}