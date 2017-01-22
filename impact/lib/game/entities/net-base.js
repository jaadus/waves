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
		this.parent();

		if( this.syncRate > 0 && ig.net.isHost() ) {
			this.timeToUpdate -= ig.system.tick;
			if( this.timeToUpdate <= 0.0 ) {
				this.sendPacket({ type: 'pos', pos: {x: this.pos.x, y: this.pos.y} });

				this.timeToUpdate = this.syncRate;
			}
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
