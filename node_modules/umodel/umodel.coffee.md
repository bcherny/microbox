# µModel

## helpers

	_ =

### extend
shallow object extend

		extend: (a, b) ->
			for own key of b
				a[key] = b[key]
			a

		trim: do ->

			if ''.trim
				(string) -> string.trim()
			else
				head = /^\s\s*/
				tail = /\s\s*$/
				(string) -> string.replace(head, '').replace(tail, '')

## µModel

	class umodel

		constructor: (@_data = {}, options) ->

Default options

			@options =
				separator: '/'

Set options

			if options
				_.extend @options, options

Set events

			@events = {}

### Get
`get {Mixed}key`

		get: (key) ->

Trigger events?

			@trigger 'get', key

Get and return

			@_get @_split(key), @_data

### Set
`set {Mixed}key, {Mixed}value`

		set: (key, value) ->

Get old value

			old = @_get @_split(key), @_data

Set and return

			@_set @_split(key), value, false, @_data

Trigger events?

			@trigger 'set', key, value, old
			
### SetNX
`setnx {Mixed}key, {Mixed}value`

		setnx: (key, value) ->

Get old value

			old = @_get @_split(key), @_data


Set if key is not yet defined in our model and return

			@_set @_split(key), value, true, @_data

Trigger events?

			@trigger 'setnx', key, value, old

### On
`on {String}"event1 [event2...], :[property]", {Function}fn` or `on {Object}map`

		on: (eventAndProperty, fn) ->

			if fn

				@_on eventAndProperty, fn

			else

				@_on e, fn for e, fn of eventAndProperty

### Trigger
Trigger 

		trigger: (event, path = '*', value, oldValue) ->

			path = @_normalize path

			if event of @events

Fire generic` event (with unspecified property), as well as events with matching properties

				for e, fns of @events[event]

Add `/` to paths to prevent false positives (eg. `foo/ba` shouldn't match `foo/bar`)

					if e is '*' or (path + '/').indexOf(e + '/') is 0

Bind and call

						for fn in fns

							if oldValue?
								fn.call @, path, value, oldValue
							else
								fn.call @, path, value

### _get
Internal `get` implementation. `accumulator` is for debugging purposes, to return the last defined key when a key is undefined

		_get: (key, parent, accumulator = []) ->

Get the next key

			head = key.shift()

Ensure that the key is defined

			if head

Return undefined if key does not exist

				if head not of parent
					return undefined

Otherwise, accumulate successful lookups for debugging purposes

				accumulator.push head

Recurse over the next deepest object

				return @_get key, parent[head], accumulator

Return the result

			parent

### Internal `set` implementation
`nx` is a flag for "set only if the given key has not been set yet". `accumulator` is a key trace for debugging purposes

		_set: (key, value, nx = false, parent, accumulator = []) ->

Get the next key

			head = key.shift()

			if key.length

Lazy create key in chain?

				if head not of parent

					parent[head] = {}

Accumulate successful lookups for debug purposes

				accumulator.push head

Recurse to our parent key

				return @_set key, value, nx, parent[head], accumulator

Set and return *if* `setnx` and the key already exists, throw an error

			if not (nx and head of parent)
				parent[head] = value

### Internal `on` implementation

		_on: (eventAndProperty, fn) ->

			parts = eventAndProperty.split ':'
			events = parts[0].split ' '
			property = @_normalize parts[1] or '*'

			for event in events

				event = _.trim event

				if event not of @events
					@events[event] = {}

				if property not of @events[event]
					@events[event][property] = []

				@events[event][property].push fn

### _normalize
Internal key normalizer

		_normalize: (key) ->

			separator = @options.separator

Trim whitespace

			key = _.trim key

Trim leading separator?

			if key.charAt(0) is separator

				key = key.slice 1

Trim trailing separator?

			if key.charAt(key.length - 1) is separator

				key = key.slice 0, -1

			key

### _split
Internal key parser, parses strings to arrays.

		_split: (key) ->

			(@_normalize key).split @options.separator