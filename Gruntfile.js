module.exports = function(grunt) {
	'use strict';

	grunt.config.init({
		uglify: {
			options: {
				mangle: {
					toplevel: true
				},
				compress: {
					dead_code: true,
					unused: true,
					join_vars: true
				},
				comments: false
			},
			standard: {
				files: {
					'dist/microbox.min.js': [
						'src/lib/_polyfills.js',
						'src/lib/_dom.js',
						'src/lib/_util.js',
						'src/lib/_template.js',
						'src/microbox.js'
					]
				}
			}
		},
		wrap: true
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);

};