
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

	false

template =

	caption: (data) ->

		"""
			<div class="caption"><span class="caption-trigger">i</span>#{data.caption}</div>
		"""

	image: (data) ->

		"""
			<img src="#{data.src}" alt="#{data.setId}" #{if data.last then ' class="cur"' else ''} />
		"""

	lightbox: (data) ->

		# template images
		images = ''
		for src, n in data.images
			images += template.image
				last: n is data.images.length
				setId: data.setId
				src: src

		# template captions
		captions = ''
		for cap in data.captions
			captions += template.caption
				caption: cap

		"""
			<div class="microbox">
				<div class="inner">
					#{images}
				</div>
				#{captions}
			</div>
		"""

microbox = do ->

	counter = -1
	model = new umodel
		sets: {}

	# generates unique set ID
	getId = ->
		while ++counter not of (model.get 'sets')
			return counter

	# toggle a lightbox
	toggle = (set, index) ->

		console.log set, index

	# collect triggers
	triggers = document.querySelectorAll 'a[href][rel^="lightbox"]'

	# initialize triggers
	_.each triggers, (trigger) ->

		href = trigger.getAttribute 'href'
		rel = trigger.getAttribute 'rel'
		title = trigger.getAttribute 'title'
		parts = rel.split '['

		# get set id
		if parts[1]
			id = parts[1].slice 0, -1
		else
			id = do getId

		# add to model
		set = model.get "sets/#{id}"

		if set

			# prevent duplicates
			if (set.triggers.indexOf trigger) < 0
				set.captions.push title
				set.images.push href
				set.triggers.push trigger

		else
			model.set "sets/#{id}",
				captions: [title]
				images: [href]
				triggers: [trigger]

		# attach click event
		set = model.get "sets/#{id}"
		index = set.triggers.indexOf trigger
		trigger.addEventListener 'click', (e) ->
			do e.preventDefault
			toggle set, index

	# build lightboxes
	html = ''
	_.each (model.get 'sets'), (set) ->
		html += template.lightbox set
	document.body.innerHTML += html
