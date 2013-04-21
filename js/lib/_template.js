/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	var template = {

		options: {},

		container: function (setId, content) {

			return '<div class="microBox" id="microBox-' + setId + '">' + content + '</div>';

		},

		images: function (setId, images) {

			var html = ['<div class="inner">'];

			images.forEach(function (image, n) {
				html.push('<img src="' + image + '" alt="' + setId + ' (' + (n+1) + ')' + '"' + (!n ? ' class="cur"' : '') + ' />');
			});

			return html.concat('</div>').join('');

		},

		pager: function (setId, images) {

			var html = [];
			var options = this.options;

			html.push('<ul class="pager">');

			if (options.showPagerTitle) {
				html.push('<li class="label">', setId, '</li>');
			}

			images.forEach(function (image, n) {
				html.push('<li><a href="#' + setId + '-' + n + '" class="' + (!n ? 'cur' : '') + '">' + (n+1) + '</a></li>');
			});

			html.push('</ul>');

			return html.join('');
		},

		setOptions: function (options) {

			this.options = options;

		}

	};

	module.exports = template;


});