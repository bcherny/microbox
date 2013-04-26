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

			var caption = captions && captions[0] ?
				'<div class="caption"><span class="microbox-caption-trigger">i</span>' + captions[0] + '</div>' :
				'';

			return [
				'<div class="inner">',
				'<img src="' + images[0] + '" alt="' + setId + '" class="cur" />',
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