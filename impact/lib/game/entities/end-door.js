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

	nextLevel: '',

	_wmIgnore: false,

	init: function( x, y, settings ) {
		this.addAnim( 'open', 0, [0], true );

		this.parent( x, y, settings );
	},

	update: function() {
		this.parent();
	}
});

});
