/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	var template = {

		options: {},

		container: function (setId, content) {

			var div = document.createElement('div');
			div.className = 'microbox';
			div.id = 'microbox-' + setId;
			div.innerHTML = content;

			return div;

		},

		images: function (setId, images, captions) {

			var caption;

			if (captions && captions[0]) {
				caption = '<figcaption><span class="microbox-caption-trigger">i</span>' + captions[0] + '</figcaption>';
			} else {
				caption = '';
			}

			return [
				'<div class="inner' + (caption ? ' has-caption' : '') + '">',
				'<figure>',
				'<img src="' + images[0] + '" alt="' + setId + '" class="cur" />',
				caption,
				'</figure>',
				'</div>'
			].join('');

		},

		setOptions: function (options) {

			this.options = options;

		}

	};

	module.exports = template;


});