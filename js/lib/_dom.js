/*global define, require, module */
define(function (require, exports, module) {


	'use strict';


	var s = {
		'#': 'ById',
		'.': 'sByClassName'
	};

	function $(selector, context) {
		var what = s[selector.charAt(0)];
		return (context || document)['getElement'+(what || 'sByTagName')](selector.slice(what ? 1 : 0));
	}


	module.exports = $;


});