(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.AggregateSource = factory();
    }
}(this, function() {
	var module = {};
	module.AggregateRootEntity = 
		function AggregateRootEntityConstructor(options, my) {
			var that = {},
				handlers = options.handlers || {},
				changes = [];

			my.applyChange = function applyChange(event) {
				if (event === null || event === undefined)
					throw new Error('The event argument cannot be null or undefined.');
				if (event.name === null || event.name === undefined) {
					var error = new Error('The event name cannot be null or undefined.');
					error.Event = event;
					throw error;
				}
				event.data = event.data || {};
				var handler = handlers[event.name];
	    		if (handler !== undefined) {
	      			handler(event.data);
	    		}
	    		changes.push(event);
			};

			that.initialize = function initialize(events) {
				if (events === null || events === undefined)
					throw new Error('The events argument cannot be null or undefined.');
		  		if (that.hasChanges())
		    		throw new Error('A changed instance cannot be initialized.');
		  		
		  		for (var index = 0, length = events.length; index < length; index++) {
		  			var event = events[index];
		  			if (event.name === null || event.name === undefined) {
		  				var error = new Error('The event name cannot be null or undefined.');
		  				error.Event = event;
		  				error.Events = events;
						throw error;
					}
		  			event.data = event.data || {};
		  			var handler = handlers[event.name];
		    		if (handler !== undefined) {
		      			handler(event.data);
		    		}
		  		}
			};

			that.hasChanges = function hasChanges() { 
				return changes.length !== 0; 
			};

			that.clearChanges = function clearChanges() {
				changes.length = 0;
			};

			that.getChanges = function getChanges() {
				return changes.slice();
			};

			return that;
		};
	return module;
}));
