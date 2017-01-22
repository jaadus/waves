ig.module(
	'game.entities.door'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntityDoor = EntityNetBase.extend({
	animSheet: new ig.AnimationSheet( 'media/door.png', 16, 32 ),

	closed: true,
	size: {x: 8, y: 32},

	zIndex: -16,
	gravityFactor: 0,
	_wmIgnore: false,

	init: function( x, y, settings ) {
		this.addAnim( 'opening', 0.025, [0,1,2,3,4,5], true );
		this.addAnim( 'closing', 0.025, [5,4,3,2,1,0], true );

		this.parent( x, y, settings );

		this.collides = (this.closed ? ig.Entity.COLLIDES.FIXED : ig.Entity.COLLIDES.NEVER);

		this.currentAnim = (this.closed ? this.anims.closing : this.anims.opening);
		this.currentAnim.gotoFrame( 5 );
	},

	update: function() {
		this.parent();
	},

	toggle: function() {
		this.sendPacket({type: 'toggle'});
	},

	processPacket: function(msg) {
		this.closed = !this.closed;
		this.collides = (this.closed ? ig.Entity.COLLIDES.FIXED : ig.Entity.COLLIDES.NEVER);
		this.currentAnim = (this.closed ? this.anims.closing : this.anims.opening);
		this.currentAnim.rewind();
		this.parent(msg);
	}
});

});
