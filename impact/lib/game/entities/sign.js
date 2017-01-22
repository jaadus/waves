ig.module(
	'game.entities.sign'
)
.requires(
	'plugins.font2',
	'game.entities.net-base'
)
.defines(function(){

EntitySign = EntityNetBase.extend({
	collides: ig.Entity.COLLIDES.NEVER,
	animSheet: new ig.AnimationSheet( 'media/sign.png', 21, 21 ),
	offset: {x: 0, y: 2},
	size: {x: 21, y: 12},

	font: new ig.Font( 'media/04b03.font.png', { fontColor: '#EEC39A', borderColor: '#543820', borderSize: 1, letterSpacing: -1 } ),

	zIndex: -24,
	gravityFactor: 0,
	_wmIgnore: false,

	text: '',
	signType: 0,

	init: function( x, y, settings ) {
		this.addAnim( 'sign_0', 0, [0], true );
		this.addAnim( 'sign_1', 0, [1], true );
		this.addAnim( 'sign_2', 0, [2], true );

		this.parent( x, y, settings );

		this.currentAnim = this.anims['sign_' + this.signType.toString()];
	},

	draw: function() {
		this.parent();

		this.font.draw(this.text, this.pos.x + this.size.x / 2 - ig.game.screen.x,
			this.pos.y + this.size.y / 2 - ig.game.screen.y - 3, ig.Font.ALIGN.CENTER);
	}
});

});
