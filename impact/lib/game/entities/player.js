ig.module(
	'game.entities.player'
)
.requires(
	'game.entities.net-base',
	'game.entities.dust-particle'
)
.defines(function(){

EntityPlayer = EntityNetBase.extend({
	animSheet: new ig.AnimationSheet( 'media/player_1.png', 16, 16 ),
	font: new ig.Font( 'media/04b03.font.png' ),
	size: {x: 16, y: 16},
	collides: ig.Entity.COLLIDES.ACTIVE,
	speed: 80,
	gravityFactor: 14,
	jumpHeight: 160,
	jumpsound: null,
	maxVel: {x: 200, y: 200},
	useDistance: 10,

	isPlayerOne: true,

	syncRate: 0.01,

	_wmIgnore: false,

	facingRight: false,
	remoteInputs: { left: false, right: false, up: false, down: false, jump: false },
	waveTime: 1.0,
	waveTimeLeft: 0,
	waveImg: new ig.Image( 'media/wave.png' ),
	waveSound: null,
	waveOffset: null,
	waveHeight: 75,

	landingSound: new ig.Sound( 'media/sfx/Player_Landing.*' ),
	hardLandingVel: 150,
	makeLandingSound: false,

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
			this.waveImg.draw( this.pos.x + this.waveOffset.x - ig.game.screen.x,
				this.pos.y + this.waveOffset.y - ig.game.screen.y);
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
		if( ig.input.pressed('use') ) {
			this._handleUse();
		}
	},

	_initAnimations: function() {
		if(this.isPlayerOne) {
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,4], false );
			this.jumpSound = new ig.Sound( 'media/sfx/Player1_Jump.*' );
			this.waveSound = new ig.Sound( 'media/sfx/Player1_Wave.*' );
			this.waveOffset = {x: 0, y: -12};
			this.name = "P1";
			this.dimension = 1;
		} else {
			this.size = {x: 16, y: 16};
			this.offset = {x: 4, y: 8};
			this.animSheet = new ig.AnimationSheet( 'media/player_2.png', 24, 24 );
			this.addAnim( 'idle', 0, [0], true );
			this.addAnim( 'run', 0.125, [1,2,3,2], false );
			this.jumpSound = new ig.Sound( 'media/sfx/Player2_Jump.*' );
			this.waveSound = new ig.Sound( 'media/sfx/Player2_Wave.*' );
			this.waveOffset = {x: 0, y: -18};
			this.name = "P2";
			this.dimension = 2;
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

		if( this.vel.y > this.hardLandingVel ) {
			this.makeLandingSound = true;
		}

		if( this.makeLandingSound && this.vel.y <= 0 ) {
			this.landingSound.play();
			this.makeLandingSound = false;

			ig.game.spawnEntity( EntityDustParticle, this.pos.x, this.pos.y + this.size.y - 8, {} );
		}
	},
	_handleUse: function() {
		var theSwitch = this._getClosestSwitch();
		if(theSwitch) {
			theSwitch.toggle();
		}
	},
	_getClosestSwitch: function() {
		var switches = this.isPlayerOne ? ig.game.aSwitches : ig.game.bSwitches;
		for(var idx in switches) {
			if(this.distanceTo(switches[idx]) < this.useDistance) {
				return switches[idx];
			}
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
