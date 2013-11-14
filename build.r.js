({
	baseUrl: 'src',
	out: 'dist/microbox.min.js',
	include: ['microbox'],
	wrap: true,
	uglify2: {
		mangle: {
			toplevel: false
		},
		compress: {
			dead_code: true,
			unused: true,
			join_vars: true
		},
		comments: false
	},
	preserveLicenseComments: false
})