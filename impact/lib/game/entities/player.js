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

	gravityFactor: 14,

	isPlayerOne: true,

	syncRate: 0.25,

	_wmIgnore: false,

	speed: 80,

	jumpHeight: 150,

	maxVel: {x: 200, y: 200},

	init: function( x, y, settings ) {
		this.addAnim( 'idle', 0, [0], true );
		this.addAnim( 'run', 0.125, [1,2,3,4], false );

		this.parent( x, y, settings );
	},

	update: function() {
		if( this.isPlayerOne != ig.game.isPlayerOne ) {
			this.parent();
			return;
		}

		this.handleInput();

		this.parent();
	},

	handleInput: function() {

		if(ig.input.pressed('jump') && this.standing) {
		    this.vel.y = -this.jumpHeight;
		}

		if(ig.input.state('moveLeft')) {
		    this.vel.x = -this.speed;
		} else if(ig.input.state('moveRight')) {
		    this.vel.x = this.speed;
		} else {
			this.vel.x = 0;
		}
	},

	processPacket: function(msg) {
		this.parent(msg);
	}
});

});
