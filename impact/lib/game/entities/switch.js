ig.module(
	'game.entities.switch'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntitySwitch = ig.Entity.extend({
	//animSheet: new ig.AnimationSheet( 'media/doors.png', 16, 2 ),
	animSheet: new ig.AnimationSheet( 'media/outdoors.png', 5, 5 ),
	closed: true,
	size: {x: 5, y: 5},
	targets: [],
	on: false,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'open', 0.125, [1], false );
	},
	update: function() {
		this.size.x = this.on ? 2 : 5;
		this.parent();
	},
	toggle: function() {
		this.on = !this.on;
		this.targets.forEach(function(name) {
			ig.game.getEntityByName(name).toggle();
		});
	}
});

});
