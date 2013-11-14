
microbox = do ->

	# model
	model = new umodel

		processed: []


	process = (trigger) ->

		# exit if this trigger has already been processed
		if trigger in model.get 'processed'
			return

			


	initialize = ->

		as = document.querySelectorAll '[rel^=lightbox]'

		process a for a in as



	# export
	{
		initialize: initialize
	}