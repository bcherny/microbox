/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	var s = {
		'#': 'ById',
		'.': 'sByClassName'
	};

	function $(selector, context) {
		var firstChar = selector.charAt(0);
		var what = s[firstChar];
		var result = (context || document)['getElement'+(what || 'sByTagName')](selector.slice(what ? 1 : 0));
		return firstChar === '#' ? [result] : result;
	}

	module.exports = $;


});