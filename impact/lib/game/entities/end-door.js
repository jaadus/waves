ig.module(
	'game.entities.end-door'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntityEndDoor = EntityNetBase.extend({
	animSheet: new ig.AnimationSheet( 'media/end_door.png', 16, 24 ),
	size: {x:16, y: 24},
	gravityFactor: 0,
	name: "endDoor",

	_wmIgnore: false,

	init: function( x, y, settings ) {
		this.addAnim( 'open', 0, [0], true );

		this.parent( x, y, settings );
	},

	update: function() {
		this.parent();
	},
	playerAtDoor: function(isPlayerOne) {
		if(isPlayerOne) {
			this.playerOneAtDoor = true;
		} else {
			this.playerTwoAtDoor = true;
		}

		if(this.playerOneAtDoor && this.playerTwoAtDoor) {
			this._reset();
			ig.game.loadNextLevel();
		}
	},
	playerNotAtDoor: function(isPlayerOne) {
		if(isPlayerOne) {
			this.playerOneAtDoor = false;
		} else {
			this.playerTwoAtDoor = false;
		}
	},
	_reset: function() {
		this.playerNotAtDoor(true);
		this.playerNotAtDoor(false);
	}
});

});
