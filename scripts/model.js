(function (global, AggregateSource, EventStore, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['AggregateSource', 'EventStore'], factory);
    } else {
        global.Model = factory(AggregateSource, EventStore);
    }
}(this, this.AggregateSource, this.EventStore, function (AggregateSource, EventStore) {
	var module = {};

	var privateInventoryItemConstructor =
		function PrivateInventoryItemConstructor(my) {
			var my = my || { }, 
				state = { activated: false, id: '' };
			var that = 
				new AggregateSource.AggregateRootEntity(
				{
					handlers: {
						'InventoryItemCreated': function InventoryItemCreated(event) {
							state.id = event.Id;
				            state.activated = true;
						},
						'InventoryItemDeactivated': function InventoryItemDeactivated(event) {
				            state.activated = false;
						}
					}
				}, my);

			that.changeName = function changeName(newName) {
				if (newName === null || newName === undefined || newName === '')
					throw new Error('The newName cannot be null, undefined or empty.');
				my.applyChange({ name: 'InventoryItemRenamed', data: { Id: state.id, NewName: newName } });
			};

			that.remove = function remove(count) {
				if (count <= 0)
					throw new Error('Cannot remove negative count from inventory.');
				my.applyChange({ name: 'ItemsRemovedFromInventory', data: { Id: state.id, Count: count } });
			}

			that.checkIn = function checkIn(count) {
				if (count <= 0)
					throw new Error('Must have a count greater than 0 to add to inventory.');
				my.applyChange({ name: 'ItemsCheckedInToInventory', data: { Id: state.id, Count: count } });
			};

			that.deactivate = function deactivate() {
				if (state.activated === false)
					throw new Error('Already deactivated.');
				my.applyChange({ name: 'InventoryItemDeactivated', data: { Id: state.id } });
			};

			return that;
		};

	module.InventoryItemRepository = 
		function InventoryItemRepositoryConstructor(options) {
			return new EventStore.Repository(
				privateInventoryItemConstructor, 
				options);
		};

	module.InventoryItem = 
		function PublicInventoryItemConstructor(id, name) {
			if (name === null || name === undefined || name === '')
				throw new Error('The name cannot be null, undefined or empty.');

			var my = {};
			var that = privateInventoryItemConstructor(my);
			my.applyChange({ name: 'InventoryItemCreated', data: { Id: id, Name: name } });
			return that;
		};

	return module;
}));
