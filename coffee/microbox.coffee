
contains = (haystack, needle) ->

	haystack.indexOf (needle) > -1

parent = (element, filter) ->

	# {Function} filter
	if izzy['function'] filter

		while _continue element

			if filter element
				return element

			element = element.parentNode

	# {Object} filter
	else

		while _continue element

			good = 0
			count = 0

			for property of filter

				e = element[property]
				f = filter[property]

				if contains element[property], filter[property]
					++good
				
				++count
			
			if count is good
				return element

			element = element.parentNode

	_continue = (element) ->
		not izzy.defined(element.documentElement) and element.tagName isnt 'HTML'

	return false

microbox = do ->

	# model
	model = new umodel

		# flag to avoid double-processing lightbox triggers
		# [Element...]
		processed: []


	process = (trigger) ->

		processed = model.get 'processed'

		# exit if this trigger has already been processed
		if trigger in processed
			return

		# ...

		# mark as processed
		processed.push trigger

	click = (event) ->

		target = event.target
		lightbox = parent target,
			rel: 'lightbox'

		if lightbox

			rel = lightbox.rel

			# endure that lightbox is rendered
			
			# or, lazy-create the lightbox
			

			# toggle lightbox visibility


	initialize = ->

		document.addEventListener 'click', click

		# as = document.querySelectorAll '[rel^=lightbox]'

		# process a for a in as



	# export
	{
		initialize: initialize
	}