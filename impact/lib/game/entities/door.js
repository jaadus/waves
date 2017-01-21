ig.module(
	'game.entities.door'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityDoor = ig.Entity.extend({
	//animSheet: new ig.AnimationSheet( 'media/doors.png', 16, 2 ),
	animSheet: new ig.AnimationSheet( 'media/player_1.png', 16, 16 ),
	closed: true,
	size: {x: 1, y: 16},

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.offset.x = 2;
		this.addAnim( 'open', 0.125, [1], false );
	},
	update: function() {
		this.currentAnim = this.anims.open;
		this.collides = this.closed ? ig.Entity.COLLIDES.FIXED : ig.Entity.COLLIDES.NEVER;
		this.parent();
	},
	open: function() {
		this.closed = false;
	},
	close: function() {
		this.closed = true;
	},
	toggle: function() {
		if(this.closed) {
			this.open();
			return;
		}

		this.close();
	}
});

});
