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

		this.parent( x, y, settings );

		this._initAnimations();
	},

	update: function() {
		if( this.isPlayerOne != ig.game.isPlayerOne ) {
			this.parent();
			return;
		}

		this._handleInput();

		this.parent();
	},

	_handleInput: function() {
		if(ig.input.pressed('jump') && this.standing) {
		    this.vel.y = -this.jumpHeight;
		    this.currentAnim = this.anims.idle;
		}
		if(ig.input.state('moveLeft')) {
		    this.vel.x = -this.speed;
		    this.currentAnim = this.anims.run;
		    this.currentAnim.flip.x = true;
		} else if(ig.input.state('moveRight')) {
		    this.vel.x = this.speed;
		    this.currentAnim = this.anims.run;
		    this.currentAnim.flip.x = false;
		} else {
			if(this.vel.x != 0) {
				this.currentAnim = this.anims.idle;
				this.currentAnim.flip.x = this.vel.x > 0 ? false : true;
			}
			this.vel.x = 0;
		}
	},

	_initAnimations: function() {
		if(this.isPlayerOne) {
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,4], false );
		} else {
			this.animSheet = new ig.AnimationSheet( 'media/player_2.png', this.size.x, this.size.y )
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,5,6], false );
		}
	},

	processPacket: function(msg) {
		this.parent(msg);
	}
});

});
