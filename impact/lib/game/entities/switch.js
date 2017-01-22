ig.module(
	'game.entities.switch'
)
.requires(
	'game.entities.net-base'
)
.defines(function(){

EntitySwitch = EntityNetBase.extend({
	animSheet: new ig.AnimationSheet( 'media/switch.png', 19, 16 ),
	size: {x: 19, y: 16},
	gravityFactor: 0,

	targetNames: [],
	on: false,
	toggleOnSound: new ig.Sound( 'media/sfx/Switch_Toggle_On.*' ),
	toggleOffSound: new ig.Sound( 'media/sfx/Switch_Toggle_Off.*' ),

	_wmIgnore: false,

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		this._populateTargetDoorNames(settings.target);

		this.addAnim( 'on', 0.125, [0], true );
		this.addAnim( 'neutral', 0.125, [1], true );
		this.addAnim( 'off', 0.125, [2], true );
	},

	update: function() {
		this.parent();
	},

	_populateTargetDoorNames: function(targets) {
		if(!targets) return;
		for (var targetKey in targets) {
			this.targetNames.push(targets[targetKey]);
		}
	},

	toggle: function() {
		this.on = !this.on;
		this.currentAnim = ( this.on ? this.anims.on : this.anims.off );
		if( this.on ) {
			this.toggleOnSound.play();
		} else {
			this.toggleOffSound.play();
		}
		this.targetNames.forEach(function(name) {
			ig.game.getEntityByName(name).toggle();
		}.bind(this));
	}
});

});
