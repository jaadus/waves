ig.module(
	'plugins.door-fix'
).requires(
	'impact.sound'
)
.defines(function() { "use strict";
	ig.Sound.inject({
		init: function( path, multiChannel ) {
			this.path = path;
			this.multiChannel = (multiChannel !== false);

			Object.defineProperty(this,"loop", {
				get: this.getLooping.bind(this),
				set: this.setLooping.bind(this)
			});

			this.load( function() {} );
		}
	});
});
