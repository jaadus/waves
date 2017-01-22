ig.module(
	'game.entities.net-base'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityNetBase = ig.Entity.extend({
	dimension: 3,
	syncRate: 0,
	timeToUpdate: 0,

	_wmIgnore: true,

	init: function( x, y, settings ) {
		this.timeToUpdate = this.syncRate;

		this.parent( x, y, settings );
	},

	update: function() {
		if( this.syncRate > 0 && ig.net.isHost() ) {
			this.timeToUpdate -= ig.system.tick;
			if( this.timeToUpdate <= 0.0 ) {
				this.sendPacket({ type: 'pos', pos: {x: this.pos.x, y: this.pos.y} });

				this.timeToUpdate = this.syncRate;
			}
		}

		this.last.x = this.pos.x;
		this.last.y = this.pos.y;
		this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;

		this.vel.x = this.getNewVelocity( this.vel.x, this.accel.x, this.friction.x, this.maxVel.x );
		this.vel.y = this.getNewVelocity( this.vel.y, this.accel.y, this.friction.y, this.maxVel.y );

		// movement & collision
		var mx = this.vel.x * ig.system.tick;
		var my = this.vel.y * ig.system.tick;
		var collMap = ((this.dimension & 1) == 0 ? ig.game.collisionMap_1 : ig.game.collisionMap_2);
		var res = collMap.trace(this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y);
		this.handleMovementTrace( res );

		if( this.currentAnim ) {
			this.currentAnim.update();
		}
	},

	sendPacket: function(entmsg) {
		ig.net.sendToAll({ type: 'ent', id: this.id, msg: entmsg });
	},

	processPacket: function(msg) {
		if( msg.type == 'pos' ) {
			this.pos.x = msg.pos.x;
			this.pos.y = msg.pos.y;
		}
	}
});

});
