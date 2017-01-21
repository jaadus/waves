ig.module(
	'game.main'
)
.requires(
	'game.net-mgr',
	'game.util',
	'game.v2',

	'game.levels.test',

	'impact.game',
	'impact.font'
)
.defines(function(){

MyGame = ig.Game.extend({

	clearColor: '#6495ED',
	font: new ig.Font( 'media/04b03.font.png' ),

	gravity: 32,

	init: function() {
		ig.net.login();

		// Initialize your game here; bind keys etc.

		this.loadLevel( LevelTest );
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

		// Add your own, additional update code here
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 400, 300, 2 );

});
