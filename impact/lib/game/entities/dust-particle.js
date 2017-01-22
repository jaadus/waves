ig.module(
	'game.entities.dust-particle'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityDustParticle = ig.Entity.extend({
	animSheet: new ig.AnimationSheet( 'media/PuffParticle.png', 16, 16 ),
	gravityFactor: 0,

	init: function( x, y, settings ) {
		this.addAnim( 'puff', .125, [0,1,2,3,4], true );

		this.parent( x, y, settings );
	},

	update: function() {
		if( this.anims.puff.loopCount > 0 ) {
			this.kill();
		}

		this.parent();
	}
});

});
