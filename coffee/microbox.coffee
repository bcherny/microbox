
# contains = (haystack, needle) ->

# 	haystack.indexOf (needle) > -1

# parent = (element, filter) ->

# 	# {Function} filter
# 	if izzy['function'] filter

# 		while _continue element

# 			if filter element
# 				return element

# 			element = element.parentNode

# 	# {Object} filter
# 	else

# 		while _continue element

# 			good = 0
# 			count = 0

# 			for property of filter

# 				e = element[property]
# 				f = filter[property]

# 				if contains element[property], filter[property]
# 					++good
				
# 				++count
			
# 			if count is good
# 				return element

# 			element = element.parentNode

# 	_continue = (element) ->
# 		not izzy.defined(element.documentElement) and element.tagName isnt 'HTML'

# 	false

template =

	caption: (data) ->

		"""
			<div class="caption">
				<span class="microbox-button caption-trigger">i</span>
				#{data.caption}
			</div>
		"""

	image: (data) ->

		"""
			<img src="#{data.src}" alt="" />
		"""

	lightbox: (data, id) ->

		# images
		images = ''
		for src, n in data.images
			images += template.image
				last: n is data.images.length
				src: src

		# captions
		captions = ''
		for cap in data.captions
			captions += template.caption
				caption: cap

		# pager
		if data.images.length > 1

			items = ''
			for item, n in data.images
				items += """
					<li microbox-trigger-set="#{id}" microbox-trigger-index="#{n}">#{n+1}</li>
				"""

			pager = """
				<ul class="microbox-pager">
					<li class="counts">#{data.active+1}/#{data.images.length}</li>
					<li microbox-trigger="prev">&#9656;</li>
					#{items}
					<li microbox-trigger="next">&#9656;</li>
				</ul>
			"""
		else
			pager = ''

		"""
			<div class="inner">
				#{images}
			</div>
			#{captions}
			#{pager}
		"""

microbox = do ->

	counter = -1
	model = new umodel
		visible: null
		sets: {}

	# generates unique set ID
	getId = ->
		while ++counter not of (model.get 'sets')
			return counter

	# toggle a lightbox
	toggle = (set, id, index) ->

		console.log set, id, index

		element = set.element

		# toggle visibility
		element.classList.toggle 'visible'

		# if visible, show the right image
		if element.classList.contains 'visible'

			images = element.querySelectorAll 'img'

			# clear active
			_.each images, (img) ->
				img.classList.remove 'visible'

			# set active
			images[index].classList.add 'visible'

			# set in model
			model.set 'visible', element

		else

			model.set 'visible', null

	# attach click event
	attach = (id, trigger) ->
		set = model.get "sets/#{id}"
		index = set.triggers.indexOf trigger
		trigger.addEventListener 'click', (e) ->
			do e.preventDefault
			toggle set, id, index

	# collect triggers
	triggers = document.querySelectorAll 'a[href][rel^="lightbox"]'

	# initialize triggers
	_.each triggers, (trigger) ->

		href = trigger.getAttribute 'href'
		rel = trigger.getAttribute 'rel'
		title = (trigger.getAttribute 'title') or ''
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
				active: 0

		# attach click event
		attach id, trigger

	# build lightboxes
	_.each (model.get 'sets'), (set, id) ->

		html = template.lightbox set, id
		element = document.createElement 'div'
		element.className = 'microbox'
		element.innerHTML = html
		document.body.appendChild element

		# store in model
		model.set "sets/#{id}/element", element

	# hide lightboxes when clicking outside of them
	document.addEventListener 'click', (e) ->

		target = e.target

		# hide lightbox
		if target.classList.contains 'inner'

			(model.get 'visible').classList.remove 'visible'

			model.set 'visible', null

		# caption trigger click event
		else if target.classList.contains 'caption-trigger'

			caption = target.parentNode
			height = caption.offsetHeight
			screen = window.innerHeight
			top = caption.style.top

			# caption is hidden
			if (not top) or ((parseInt top, 10) is screen)

				newTop = screen - height
				caption.style.top = "#{newTop}px"

			else

				caption.style.top = "#{screen}px"