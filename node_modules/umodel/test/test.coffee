
Model = require '../umodel'

exports.umodel =

	initialize: (test) ->

		# with data
		model = new Model foo: 'bar'
		actual = model._data.foo
		expected = 'bar'

		test.equal actual, expected, 'initializes with data'

		# with options
		model = new Model {}, separator: '.'
		actual = model.options.separator
		expected = '.'

		test.equal actual, expected, 'initializes with options'

		test.done()

	get: (test) ->

		model = new Model
		model._data =
			foo: 'bar'
			bar: null
			baz:
				moo: 'boo'

		# shallow
		actual = model.get 'foo'
		expected = 'bar'
		test.equal actual, expected, 'shallow get'

		# deep
		actual = model.get 'baz/moo'
		expected = 'boo'
		test.equal actual, expected, 'deep get'

		# error
		actual = model.get 'woo'
		expected = undefined
		test.equal actual, expected, 'getting an undefined key returns undefined'

		# falsey value
		actual = model.get 'bar'
		expected = null
		test.equal actual, expected, 'get falsey'

		test.done()

	set: (test) ->

		model = new Model

		# shallow
		model.set 'foo', 'bar'
		actual = model._data.foo
		expected = 'bar'
		test.equal actual, expected, 'shallow set'

		# deep
		model.set 'baz/moo', 'boo'
		actual = model._data.baz.moo
		expected = 'boo'
		test.equal actual, expected, 'deep set'

		test.done()

	setnx: (test) ->

		model = new Model

		# shallow set
		model.setnx 'foo', 'bar'
		actual = model._data.foo
		expected = 'bar'

		test.equal actual, expected, 'shallow setnx sets'

		# shallow set doesn't override
		model.setnx 'foo', 'baz'
		actual = model._data.foo
		expected = 'bar'

		test.equal actual, expected, 'shallow setnx does not override once set'

		# deep set
		model.setnx 'baz/moo', 'boo'
		actual = model._data.baz.moo
		expected = 'boo'

		test.equal actual, expected, 'deep setnx sets'

		# deep set doesn't override
		model.setnx 'baz/moo', 'woo'
		actual = model._data.baz.moo
		expected = 'boo'

		test.equal actual, expected, 'deep setnx sets does not override once set'

		test.done()

	'on (unspecified property)': (test) ->

		model = new Model
			foo:
				bar: 'baz'

		# get all
		calledGet = false
		model.on 'get', -> calledGet = true
		model.get 'foo'
		test.equal calledGet, true, 'on get all'

		# set all
		calledSet = false
		model.on 'set', -> calledSet = true
		model.set 'foo/bar', 'moo'
		test.equal calledSet, true, 'on set all'

		# setnx all
		calledSetnx = false
		model.on 'setnx', -> calledSetnx = true
		model.setnx 'foo/bar', 'moo'
		test.equal calledSetnx, true, 'on setnx all'

		test.done()

	'on (one event)': (test) ->

		model = new Model
			foo:
				bar: 'baz'

		# get
		calledGet = false
		model.on 'get: foo', -> calledGet = true
		model.get 'foo/bar'
		test.equal calledGet, true, 'on get prop'

		# set
		calledSet = false
		model.on 'set: foo', -> calledSet = true
		model.set 'foo/bar', 'moo'
		test.equal calledSet, true, 'on set prop'

		# setnx
		calledSetnx = false
		model.on 'setnx: foo', -> calledSetnx = true
		model.setnx 'foo/bar', 'moo'
		test.equal calledSetnx, true, 'on setnx prop'

		test.done()

	'on (multiple events)': (test) ->

		model = new Model
			foo:
				bar: 'baz'

		# get all
		calledAll = 0
		model.on 'get set setnx', -> calledAll++
		model.get 'foo/bar'
		model.set 'foo/bar', 'moo'
		model.setnx 'foo/bar', 'moo'
		test.equal calledAll, 3, 'on get set setnx all'

		calledProp = 0
		model.on 'get set setnx: foo', -> calledProp++
		model.get 'foo/bar'
		model.set 'foo/bar', 'moo'
		model.setnx 'foo/bar', 'moo'
		test.equal calledProp, 3, 'on get set setnx prop'

		test.done()

	'on (called with object)': (test) ->

		model = new Model
			foo: 'bar'
			bar: 'baz'

		called = 0
		call = -> called++

		model.on
			'get: foo': call
			'get: bar': call

		model.get 'foo'
		model.get 'bar'

		test.equal called, 2, 'on accepts objects'
		test.done()

	'on (set gives old value)': (test) ->

		prev = 'bar'
		curr = 'baz'

		model = new Model
			foo: prev

		model.on 'set', (key, value, previous) ->
			curr = value
			prev = previous

		model.set 'foo', 'baz'

		test.equal prev, 'bar', 'previous value'
		test.equal curr, 'baz', 'current value'
		test.done()

	'trigger': (test) ->

		model = new Model
			foo:
				bar: 'baz'

		called = false
		call = -> called = true

		model.on 'get foo/bar', call
		model.trigger 'get', 'foo/bar'

		test.equal called, true, 'trigger triggers events'
		test.done()