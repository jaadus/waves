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

	speed: 80,
	gravityFactor: 14,
	jumpHeight: 150,
	maxVel: {x: 200, y: 200},

	isPlayerOne: true,

	syncRate: 0.25,

	_wmIgnore: false,

	remoteInputs: { left: false, right: false, up: false, down: false, jump: false },

	init: function( x, y, settings ) {

		this.parent( x, y, settings );

		this._initAnimations();
	},

	update: function() {
		this._handleMoveLogic();

		if( this.isPlayerOne != ig.game.isPlayerOne ) {
			this.parent();
			return;
		}

		this._handleInput();

		this.parent();
	},

	_handleInput: function() {
		if (ig.input.pressed('moveLeft') || ig.input.released('moveLeft')) {
			this.sendPacket({type: 'key', left: ig.input.pressed('moveLeft') == true});
		}
		if (ig.input.pressed('moveRight') || ig.input.released('moveRight')) {
			this.sendPacket({type: 'key', right: ig.input.pressed('moveRight') == true});
		}
		if (ig.input.pressed('up') || ig.input.released('up')) {
			this.sendPacket({type: 'key', up: ig.input.pressed('up') == true});
		}
		if (ig.input.pressed('down') || ig.input.released('down')) {
			this.sendPacket({type: 'key', down: ig.input.pressed('down') == true});
		}
		if (ig.input.pressed('jump') || ig.input.released('jump')) {
			this.sendPacket({type: 'key', jump: ig.input.pressed('jump') == true});
		}
	},

	_initAnimations: function() {
		if(this.isPlayerOne) {
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,4], false );
		} else {
			this.animSheet = new ig.AnimationSheet( 'media/player_2.png', this.size.x, this.size.y );
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,2], false );
		}
	},

	_handleMoveLogic: function() {
		if(this.remoteInputs.jump && this.standing) {
			this.vel.y = -this.jumpHeight;
			this.currentAnim = this.anims.idle;
		}
		if(this.remoteInputs.left) {
			this.vel.x = -this.speed;
			this.currentAnim = this.anims.run;
			this.currentAnim.flip.x = true;
		} else if(this.remoteInputs.right) {
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

	processPacket: function(msg) {
		if( msg.type == 'key' ) {
			var remoteKeys = Object.keys( this.remoteInputs );
			for( var i = 0; i < remoteKeys.length; ++i ) {
				if( remoteKeys[i] in msg ) {
					this.remoteInputs[remoteKeys[i]] = msg[remoteKeys[i]];
				}
			}
		}

		this.parent(msg);
	}
});

});
