
u = require '../u'

exports['each (object)'] = (test) ->

	items =
		one: 'foo'
		two: 'bar'
		tre: 'baz'

	accumulator = ''
	expected = 'foobarbaz'

	u.each items, (value) ->
		accumulator += value

	test.equal accumulator, expected

	do test.done

exports['each (array)'] = (test) ->

	items = [1,1,2,3,5,8,13,21]
	accumulator = 0
	expected = 54

	u.each items, (value) ->
		accumulator += value

	test.equal accumulator, expected

	do test.done

exports.extend = (test) ->

	one =
		foo: 1
	two =
		bar: 2
	three =
		baz: 3
	four =
		baz: 4

	u.extend one, two, three, four

	test.equal one.foo, 1
	test.equal one.bar, 2
	test.equal one.baz, 4

	do test.done

exports.fluent = (test) ->

	obj =
		fn: u.fluent ->
			'foo'

	test.deepEqual (do obj.fn), obj

	do test.done

exports.one = (test) ->

	items =
		one: 'foo'
		two: 'bar'
		tre: 'baz'

	test.equal (u.one items), 'one'

	do test.done

exports.keys = (test) ->

	items =
		one: 'foo'
		two: 'bar'
		tre: 'baz'

	test.deepEqual (u.keys items), ['one', 'two', 'tre']

	do test.done