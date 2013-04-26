/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	var template = {

		options: {},

		container: function (setId, content) {

			var div = document.createElement('div');
			var options = this.options;
			div.className = options.classes.lightbox;
			div.id = options.ids.lightboxPrefix + setId;
			div.innerHTML = content;

			return div;

		},

		images: function (setId, images, captions) {

			var classes = this.options.classes;
			var caption = captions && captions[0] ?
				'<div class="' + classes.caption + '"><span class="' + classes.captionTrigger + '">i</span>' + captions[0] + '</div>' :
				'';

			return [
				'<div class="' + classes.lightboxInner + '">',
				'<img src="' + images[0] + '" alt="' + setId + '" class="' + classes.imageCurrent + '" />',
				'</div>',
				caption
			].join('');

		},

		setOptions: function (options) {

			this.options = options;

		}

	};

	module.exports = template;


});