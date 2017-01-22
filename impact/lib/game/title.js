ig.module(
	'game.title'
)
.requires(
	'game.lobby',

	'impact.game'
)
.defines(function(){

Title = ig.Game.extend({
	font: new ig.Font( 'media/04b03.font.png' ),
	logoImg: new ig.Image( 'media/logo.png' ),

	init: function() {
		this.keydownFunc = function( event ) {
			var tag = event.target.tagName;
			if( tag == 'INPUT' || tag == 'TEXTAREA' || event.type != 'keydown' ) { return; }

			window.removeEventListener('keydown', this.keydownFunc);
			ig.system.setGame( Lobby );
		}.bind(this);
		window.addEventListener('keydown', this.keydownFunc, false );
	},

	update: function() {
		this.parent();
	},

	draw: function() {
		this.parent();
		this.logoImg.draw(30, 30);
		this.font.draw('Press ANY Key to Play', ig.system.width / 2, ig.system.height * .75, ig.Font.ALIGN.CENTER);
	}
});

ig.main( '#canvas', Title, 60, 400, 300, 2 );

});
