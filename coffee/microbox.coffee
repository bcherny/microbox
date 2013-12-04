template = (data, id) ->

	# images
	images = ''
	for src in data.images
		images += """
			<img src="#{src}" alt="" />
		"""

	# captions
	captions = ''
	for caption, n in data.captions when caption
		captions += """
			<div class="caption" microbox-caption="#{n}">
				<span class="microbox-button" microbox-trigger-caption>i</span>
				#{caption}
			</div>
		"""

	# pager
	if data.images.length > 1

		items = ''
		for item, n in data.images
			items += """
				<li microbox-trigger-set="#{id}" microbox-trigger-index="#{n}">#{n+1}</li>
			"""

		pager = """
			<ul class="microbox-pager">
				<li class="microbox-counts">#{data.active+1}/#{data.images.length}</li>
				<li microbox-trigger-prev microbox-trigger-set="#{id}">&#9656;</li>
				#{items}
				<li microbox-trigger-next microbox-trigger-set="#{id}">&#9656;</li>
			</ul>
		"""
	else
		pager = ''

	# return
	"""
		<span class="microbox-button microbox-close" microbox-close>&times;</span>
		<div class="inner">
			#{images}
		</div>
		#{captions}
		#{pager}
	"""

bound = (thing, min, max) ->
	if thing < min
		thing = min
	else if thing > max
		thing = max
	thing

microbox = do ->

	counter = -1
	model = new umodel
		visible: null
		sets: {}

	# generates unique set ID
	getId = ->
		while ++counter not of (model.get 'sets')
			return counter

	# toggles a lightbox
	# 
	# @id		{String}		set id
	# @index	{Number|String}	index in set
	# @show		{Boolean}		show, not toggle
	# 
	toggle = (id, index = 0, show) ->

		# check for set id
		if not id?
			console.error "microbox.toggle expects a set ID, given '#{id}'"
			return false

		set = model.get "sets/#{id}"
		max = set.images.length - 1
		element = set.element

		# validate set id
		if not set?
			console.error "microbox.toggle passed an invalid set id '#{id}'"
			return false

		# coerce index to Number, validate index
		index = bound +index, 0, max

		# toggle visibility
		verb = if show? then 'add' else 'toggle'
		_.classList[verb] element, 'visible'

		# if visible, show the right image
		if _.classList.contains element, 'visible'

			components = set.components

			#
			# image
			#

			# clear active
			_.each components.images, (item) ->
				_.classList.remove item, 'visible'

			# set active image
			_.classList.add components.images[index], 'visible'

			#
			# pager
			#

			# update pager text
			components.counts.innerHTML = "#{index+1}/#{set.images.length}"

			# deactivate pager items
			_.each components.pagerItems, (item) ->
				_.classList.remove item, 'active'

			# activate pager item
			_.classList.add components.pagerItems[index], 'active'
			
			# deactivate "<" arrow?
			verb = if index is 0 then 'add' else 'remove'
			_.classList[verb] components.prev, 'disabled'
			
			# deactivate ">" arrow?
			verb = if index is max then 'add' else 'remove'
			_.classList[verb] components.next, 'disabled'

			#
			# caption
			#

			# hide and deactivate all captions
			_.each components.captions, (item) ->
				_.classList.add item, 'hide'
				_.classList.remove item, 'active'
				item.style.top = ''
			
			# reset pager
			components.pager.style.bottom = ''

			# activate this caption
			caption = components.captions[index]
			if caption
				_.classList.remove caption, 'hide'

			#
			# model
			# 

			# update active index in model
			set.active = index

			# set active set in model
			model.set 'visible', element

		else

			model.set 'visible', null

	# attach click event
	attach = (id, trigger) ->
		set = model.get "sets/#{id}"
		index = set.triggers.indexOf trigger
		trigger.addEventListener 'click', (e) ->
			do e.preventDefault
			toggle id, index

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

		html = template set, id
		element = document.createElement 'div'
		element.className = 'microbox'
		element.innerHTML = html
		document.body.appendChild element

		# store in model
		set = model.get "sets/#{id}"

		# cache elements
		set.element = element
		set.components =
			captions: []
			counts: element.querySelector '.microbox-counts'
			images: element.querySelectorAll 'img'
			pager: element.querySelector '.microbox-pager'
			pagerItems: element.querySelectorAll '[microbox-trigger-index]'
			next: element.querySelector '[microbox-trigger-next]'
			prev: element.querySelector '[microbox-trigger-prev]'

		_.each (element.querySelectorAll '[microbox-caption]'), (item) ->
			id = +item.getAttribute 'microbox-caption'
			set.components.captions[id] = item

	# hide lightboxes when clicking outside of them
	document.addEventListener 'click', (e) ->

		target = e.target

		# if clicked off a lightbox or clicked on the (x) while it is open, hide the lightbox
		if (_.classList.contains target, 'inner') or (target.hasAttribute 'microbox-close')

			_.classList.remove (model.get 'visible'), 'visible'

			model.set 'visible', null

		# trigger set @ index
		else if (target.hasAttribute 'microbox-trigger-index') and (target.hasAttribute 'microbox-trigger-set')

			set = target.getAttribute 'microbox-trigger-set'
			index = target.getAttribute 'microbox-trigger-index'

			toggle set, index, true

		# trigger prev/next
		else if (target.hasAttribute 'microbox-trigger-next') or (target.hasAttribute 'microbox-trigger-prev')

			set = target.getAttribute 'microbox-trigger-set'
			index = model.get "sets/#{set}/active"

			if target.hasAttribute 'microbox-trigger-next'
				++index
			else
				--index

			toggle set, index, true

		# toggle caption
		else if target.hasAttribute 'microbox-trigger-caption'

			caption = target.parentNode
			height = caption.offsetHeight
			screen = window.innerHeight
			top = caption.style.top
			pager = caption.parentNode.querySelector '.microbox-pager'

			# caption is hidden -> show it
			if (not top) or ((parseInt top, 10) is screen)

				# show caption
				newTop = screen - height
				caption.style.top = "#{newTop}px"
				_.classList.add caption, 'active'

				# move pager up
				pager.style.bottom = "#{height + 10}px"

			# hide it
			else

				_.classList.remove caption, 'active'
				caption.style.top = ''

				# move pager down
				pager.style.bottom = ''