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

	isPlayerOne: true,

	init: function() {
		// Initialize your game here; bind keys etc.
		this.bindKeys();

		this.loadLevel( LevelTest );
	},

	loadLevel: function( data ) {
		this.screen = {x: 0, y: 0};

		// Entities
		this.entities = [];
		this.namedEntities = {};
		for( var i = 0; i < data.entities.length; i++ ) {
			var ent = data.entities[i];
			this.spawnEntity( ent.type, ent.x, ent.y, ent.settings );
		}
		this.sortEntities();

		// Map Layer
		this.collisionMap = ig.CollisionMap.staticNoCollision;
		this.backgroundMaps = [];
		for( var i = 0; i < data.layer.length; i++ ) {
			var ld = data.layer[i];
			if( ld.name == 'collision_1' ) {
				if( this.isPlayerOne ) {
					this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data );
				}
			}
			if( ld.name == 'collision_2' ) {
				if( !this.isPlayerOne ) {
					this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data );
				}
			}
			else {
				if( (this.isPlayerOne && ld.visibleToPlayerOne) || (!this.isPlayerOne && ld.visibleToPlayerTwo) ) {
					var newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
					newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
					newMap.repeat = ld.repeat;
					newMap.distance = ld.distance;
					newMap.foreground = !!ld.foreground;
					newMap.preRender = !!ld.preRender;
					newMap.name = ld.name;
					this.backgroundMaps.push( newMap );
				}
			}
		}

		// Call post-init ready function on all entities
		for( var i = 0; i < this.entities.length; i++ ) {
			this.entities[i].ready();
		}
	},

	bindKeys: function() {
		ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
		ig.input.bind( ig.KEY.SPACE, 'jump' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'moveRight');
		ig.input.bind( ig.KEY.LEFT_ARROW, 'moveLeft');
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

	ig.main( '#canvas', MyGame, 60, 400, 300, 2 );
});

});
