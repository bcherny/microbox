var template = {

	container: function (setId, content, options) {

		var div = document.createElement('div');
		div.className = options.classes.lightbox;
		div.id = options.ids.lightboxPrefix + setId;
		div.innerHTML = content;

		return div;

	},

	images: function (setId, images, captions, options) {

		var classes = options.classes;
		var caption = captions && captions[0] ?
			'<div class="' + classes.caption + '"><span class="' + classes.captionTrigger + '">i</span>' + captions[0] + '</div>' :
			'';

		return [
			'<div class="' + classes.lightboxInner + '">',
			'<img src="' + images[0] + '" alt="' + setId + '" class="' + classes.imageCurrent + '" />',
			'</div>',
			caption
		].join('');

	}

};