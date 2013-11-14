/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	var template = {

		container: function (setId, content) {

			var div = document.createElement('div');
			div.className = 'microbox';
			div.id = 'microbox-' + setId;
			div.innerHTML = content;

			return div;

		},

		images: function (setId, images) {

			var html = ['<div class="inner">'];

			images.forEach(function (image, n) {
				html.push('<img src="' + image + '" alt="' + setId + ' (' + (n+1) + ')' + '" />');
			});

			return html.concat('</div>').join('');

		},

		pager: function (setId, images) {

			var html = [];
			var options = this.options;

			html.push('<table class="microbox-pager"><tr>');

			if (options.showPagerTitle) {
				html.push('<td class="microbox-pager-label">', setId, '</td>');
			}

			images.forEach(function (image, n) {
				html.push('<td data-microbox-set="' + setId + '" data-microbox-page="' + n + '">' + (n+1) + '</td>');
			});

			html.push('</tr></table>');

			return html.join('');
		},

		setOptions: function (options) {

			this.options = options;

		}

	};

	module.exports = template;


});