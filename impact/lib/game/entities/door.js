ig.module(
	'game.entities.door'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntityDoor = EntityNetBase.extend({
	//animSheet: new ig.AnimationSheet( 'media/doors.png', 16, 2 ),
	animSheet: new ig.AnimationSheet( 'media/outdoors.png', 2, 16 ),
	closed: true,
	size: {x:8, y: 24},

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.addAnim( 'open', 0.125, [15], false );
		this.gravityFactor = 0;
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
		this.closed = !this.closed;
	}
});

});
