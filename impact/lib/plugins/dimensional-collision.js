ig.module(
	'plugins.dimensional-collision'
).requires(
	'game.entities.player',
	'impact.entity'
)
.defines(function() { "use strict";
	ig.Entity.inject({
		draw: function() {
			if (this.dimension != undefined) {
				var playerDimension = ig.game.getEntityByName(ig.game.isPlayerOne ? "P1" : "P2").dimension;
				if( !this instanceof EntityPlayer && (this.dimension & playerDimension) == 0 ) {
					return;
				}
			}

			this.parent();
		}
	});

	ig.Entity.checkPair = function( a, b ) {
		// Do these entities want checks?
		if( a.checkAgainst & b.type ) {
			a.check( b );
		}

		if( b.checkAgainst & a.type ) {
			b.check( a );
		}

		// If this pair allows collision, solve it! At least one entity must
		// collide ACTIVE or FIXED, while the other one must not collide NEVER.
		if(
			a.collides && b.collides &&
			(a.dimension & b.dimension) != 0 &&
			a.collides + b.collides > ig.Entity.COLLIDES.ACTIVE
		) {
			ig.Entity.solveCollision( a, b );
		}
	};
});
