ig.module(
	'game.entities.switch'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntitySwitch = EntityNetBase.extend({
	//animSheet: new ig.AnimationSheet( 'media/doors.png', 16, 2 ),
	animSheet: new ig.AnimationSheet( 'media/outdoors.png', 5, 5 ),
	closed: true,
	size: {x: 5, y: 5},
	targetNames: [],
	gravityFactor: 0,
	on: false,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this._populateTargetDoorNames(settings.targets);
		this.addAnim( 'open', 0.125, [1], false );
	},
	update: function() {
		this.size.x = this.on ? 2 : 5;
		this.parent();
	},
	_populateTargetDoorNames: function(targets) {
		if(!targets) return;
		for (var targetKey in targets) {
		    this.targetNames.push(targets[targetKey]);
		}
	},
	toggle: function() {
		this.on = !this.on;
		this.targetNames.forEach(function(name) {
			ig.game.getEntityByName(name).toggle();
		});
	}
});

});
