ig.module(
	'game.entities.door'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntityDoor = EntityNetBase.extend({
	openImg: new ig.Image( 'media/door_open.png' ),
	closeImg: new ig.Image( 'media/door_closed.png' ),
	closed: true,
	imageOffset: {x: -8, y: 0},
	size: {x: 8, y:20},

	_wmIgnore: false,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.closeImg.height = this.openImg.height = 24;
		this.gravityFactor = 0;
	},
	update: function() {
		this.currentAnim = this.anims.close;
		this.collides = this.closed ? ig.Entity.COLLIDES.FIXED : ig.Entity.COLLIDES.NEVER;
		this.parent();
	},
	open: function() {
		this.closed = false;
	},
	close: function() {
		this.closed = true;
	},
	draw: function() {

		if((ig.game.isPlayerOne && this.dimension == 2)
			|| (!ig.game.isPlayerOne && this.dimension == 1)) {
				return;
		}

		var img = this.closed ? this.closeImg : this.openImg;

		img.draw(this.pos.x + this.imageOffset.x - ig.game.screen.x,
			this.pos.y + this.imageOffset.y - ig.game.screen.y);

		this.parent();
	},
	toggle: function() {
		this.sendPacket({type: 'toggle'});
	},
	processPacket: function(msg) {
		this.closed = !this.closed;
		this.parent(msg);
	}
});

});
