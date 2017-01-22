ig.module(
	'game.entities.player'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntityPlayer = EntityNetBase.extend({
	animSheet: new ig.AnimationSheet( 'media/player_1.png', 16, 16 ),
	font: new ig.Font( 'media/04b03.font.png' ),
	size: {x: 16, y: 16},

	speed: 80,
	gravityFactor: 14,
	jumpHeight: 150,
	jumpsound: null,
	maxVel: {x: 200, y: 200},

	isPlayerOne: true,

	syncRate: 0.25,

	_wmIgnore: false,

	facingRight: false,
	remoteInputs: { left: false, right: false, up: false, down: false, jump: false },
	waveTime: 1.0,
	waveTimeLeft: 0,
	waveImg: new ig.Image( 'media/wave.png' ),
	waveSound: null,
	waveOffset: null,
	waveHeight: 75,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this._initAnimations();
	},

	update: function() {
		this._handleMoveLogic();

		if( this.waveTimeLeft > 0.0 ) {
			this.waveTimeLeft -= ig.system.tick;
			this.waveTimeLeft = Math.max( this.waveTimeLeft, 0.0 );
		}

		if( this.isPlayerOne != ig.game.isPlayerOne ) {
			this.parent();
			return;
		}

		this._handleInput();

		this.parent();
	},

	draw: function() {
		if( this.waveTimeLeft > 0 ) {
			this.waveImg.draw( this.pos.x + this.waveOffset.x, this.pos.y + this.waveOffset.y );
		}

		this.parent();
	},

	_handleInput: function() {
		if (ig.input.pressed('moveLeft') || ig.input.released('moveLeft')) {
			this.sendPacket({type: 'key', left: !!ig.input.pressed('moveLeft') == true});
		}
		if (ig.input.pressed('moveRight') || ig.input.released('moveRight')) {
			this.sendPacket({type: 'key', right: !!ig.input.pressed('moveRight') == true});
		}
		if (ig.input.pressed('up') || ig.input.released('up')) {
			this.sendPacket({type: 'key', up: !!ig.input.pressed('up') == true});
		}
		if (ig.input.pressed('down') || ig.input.released('down')) {
			this.sendPacket({type: 'key', down: !!ig.input.pressed('down') == true});
		}
		if (ig.input.pressed('jump') || ig.input.released('jump')) {
			this.sendPacket({type: 'key', jump: !!ig.input.pressed('jump') == true});
		}
		if( ig.input.pressed('wave') ) {
			this.sendPacket({type: 'wave'});
		}
	},

	_initAnimations: function() {
		if(this.isPlayerOne) {
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,4], false );
			this.jumpSound = new ig.Sound( 'media/sfx/Player1_Jump.*' );
			this.waveSound = new ig.Sound( 'media/sfx/Player1_Wave.*' );
			this.waveOffset = {x: 0, y: -12};
		} else {
			this.size = {x: 24, y: 24};
			this.animSheet = new ig.AnimationSheet( 'media/player_2.png', this.size.x, this.size.y );
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,2], false );
			this.jumpSound = new ig.Sound( 'media/sfx/Player2_Jump.*' );
			this.waveSound = new ig.Sound( 'media/sfx/Player2_Wave.*' );
			this.waveOffset = {x: 4, y: -10};
		}
	},

	_handleMoveLogic: function() {
		this.currentAnim = this.anims.idle;

		if(this.remoteInputs.jump && this.standing) {
			this.vel.y = -this.jumpHeight;
			this.currentAnim = this.anims.idle;
			this.jumpSound.play();
		}
		if(this.remoteInputs.left) {
			this.facingRight = false;
			this.vel.x = -this.speed;
			this.currentAnim = this.anims.run;
		} else if(this.remoteInputs.right) {
			this.facingRight = true;
			this.vel.x = this.speed;
			this.currentAnim = this.anims.run;
		} else {
			if(this.vel.x != 0) {
				this.currentAnim = this.anims.idle;
				this.currentAnim.flip.x = this.vel.x > 0 ? false : true;
			}
			this.vel.x = 0;
		}
		this.currentAnim.flip.x = !this.facingRight;
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

		if( msg.type == 'wave' ) {
			this.waveTimeLeft = this.waveTime;
			this.waveSound.play();

			if( this.standing ) {
				this.vel.y = -this.waveHeight;
			}
		}

		this.parent(msg);
	}
});

});
