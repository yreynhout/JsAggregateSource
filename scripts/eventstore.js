var EventStore = (function () {
	var module = {};
	module.Repository = function RepositoryConstructor(rootFactory, options) {
		if (rootFactory === undefined || rootFactory === null)
			throw new Error('The rootFactory argument cannot be null or undefined.');
		if (options === undefined || options === null)
			throw new Error('The options argument cannot be null or undefined.');
		if (options.baseUrl === undefined || options.baseUrl === null)
			throw new Error('The options.baseUrl cannot be null or undefined.');
		options.requireStream = options.requireStream || true;
		options.streamNameResolver = options.streamNameResolver || function(id) { return id; };

		var that = {}, 
			process = function process(feed, root, completion) {
				root.initialize(
					feed.entries.
						map(function(entry) { 
							return {
								"name": entry.eventType, 
								"data": JSON.parse(entry.data) 
							};
						}).
						reverse());
				var links = feed.links.filter(function(link) { return link.relation === "previous"; });
				if (links.length === 1) {
					$.ajax({
						type:'GET',
						url: links[0].uri + '?embed=body'
						//dataType: 'application/vnd.eventstore.atom+json'
					}).done(function(next) {
						process(next, root, completion);
					});
				} else {
					completion.resolve(root);
				}
			};

		that.get = function get(id) {
			if (id === undefined || id === null)
				throw new Error('The id argument cannot be null or undefined.');
			var streamName = options.streamNameResolver(id);
			var completion = new $.Deferred();
			var root = rootFactory();
			$.ajax({
				type:'GET',
				url: options.baseUrl + streamName
				//dataType: 'application/vnd.eventstore.atom+json'
			}).done(function(initialFeed) {
				var links = initialFeed.links.filter(function(link) { return link.relation === "last"; });
				if (links.length === 1) {
					$.ajax({
						type:'GET',
						url: links[0].uri + '?embed=body'
						//dataType: 'application/vnd.eventstore.atom+json'
					}).done(function(lastFeed) {
						process(lastFeed, root, completion);
					});
				} else {
					if (options.requireStream)
						completion.reject();
					else 
						completion.resolve(root);
				}
			});
			return completion.promise();
		};

		return that;
	}
	return module;
}());