ig.module(
	'game.main'
)
.requires(
	'game.net-mgr',
	'game.util',
	'game.v2',

	'game.levels.waves',
	'game.entities.switch',

	'impact.game',
	'impact.font',
	'plugins.dimensional-collision',
	'plugins.door-fix', // ENGINE FIX :P

	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Game.extend({

	clearColor: '#6495ED',
	font: new ig.Font( 'media/04b03.font.png' ),

	gravity: 32,

	isPlayerOne: true,
	collisionMap_1: null,
	collisionMap_2: null,

	init: function() {
		this.isPlayerOne = ig.net.isHost();

		this.bindKeys();

		this.loadLevel( LevelWaves );
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
		this.collisionMap_1 = ig.CollisionMap.staticNoCollision;
		this.collisionMap_2 = ig.CollisionMap.staticNoCollision;

		this.backgroundMaps = [];
		for( var i = 0; i < data.layer.length; i++ ) {
			var ld = data.layer[i];
			if( ld.name == 'collision_1' ) {
				this.collisionMap_1 = new ig.CollisionMap( ld.tilesize, ld.data );
			}
			if( ld.name == 'collision_2' ) {
				this.collisionMap_2 = new ig.CollisionMap( ld.tilesize, ld.data );
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

	getMapByName: function( name ) {
		if( name == 'collision_1' ) {
			return this.collisionMap_1;
		}
		else if( name == 'collision_2' ) {
			return this.collisionMap_2;
		}

		for( var i = 0; i < this.backgroundMaps.length; i++ ) {
			if( this.backgroundMaps[i].name == name ) {
				return this.backgroundMaps[i];
			}
		}

		return null;
	},

	sortEntities: function() {
		this.aSwitches = this.entities.filter(function(el) {
			return el instanceof EntitySwitch && el.dimension == 1;
		}, this);
		this.bSwitches = this.entities.filter(function(el) {
			return el instanceof EntitySwitch && el.dimension == 2;
		}, this);

		this.parent();
	},

	bindKeys: function() {
		ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
		ig.input.bind( ig.KEY.SPACE, 'jump' );
		ig.input.bind( ig.KEY.E, 'use');
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'moveRight');
		ig.input.bind( ig.KEY.LEFT_ARROW, 'moveLeft');
		ig.input.bind( ig.KEY.W, 'jump' );
		ig.input.bind( ig.KEY.D, 'moveRight');
		ig.input.bind( ig.KEY.A, 'moveLeft');
		ig.input.bind( ig.KEY.Q, 'wave');
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();

		// Add your own, additional update code here
		var playerNumber = this.isPlayerOne ? 1 : 2;
		var player = this.getEntityByName('P'+playerNumber);
		if (player) {
			this.screen.x = player.pos.x - ig.system.width / 2;
			this.screen.y = player.pos.y - ig.system.height / 2;
		}
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	},

	getEntityById: function( id ) {
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( ent.id == id && !ent._killed ) {
				return ent;
			}
		}

		return null;
	}
});

});
