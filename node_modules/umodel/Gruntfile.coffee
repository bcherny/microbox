module.exports = (grunt) ->

	grunt.config.init

		coffee:

			compile:
				files:
					'umodel.js': 'umodel.coffee.md'
				options:
					bare: true

		nodeunit:
			all: ['test/test.js']

		uglify:

			options:
				mangle:
					toplevel: true
				compress:
					dead_code: true
					unused: true
					join_vars: true
				comments: false

			standard:
				files:
					'umodel.min.js': [
						'umodel.js'
					]

		umd:
			all:
				src: 'umodel.js'
				objectToExport: 'umodel'
				amdModuleId: 'umodel'
				globalAlias: 'umodel'


	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-nodeunit'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-umd'

	grunt.registerTask 'default', ['coffee', 'umd', 'nodeunit', 'uglify']