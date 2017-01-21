ig.module(
	'game.entities.player'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntityPlayer = EntityNetBase.extend({
	animSheet: new ig.AnimationSheet( 'media/player_1.png', 16, 16 ),
	size: {x: 16, y: 16},

	syncRate: 0.25,

	_wmIgnore: false,

	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0, [0], true );
		this.addAnim( 'run', 0.125, [1,2,3,4], true );

		this.parent( x, y, settings );
	},

	update: function() {
		this.parent();
	},

	processPacket: function(msg) {
		this.parent(msg);
	}
});

});
