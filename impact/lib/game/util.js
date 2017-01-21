ig.module(
	'game.util'
)
.requires(
	'game.v2'
)
.defines(function(){

ig.util = {}

ig.util.randInt = function( min, max ) {
	return Math.floor(Math.random() * (max - min) + min);
}

ig.util.drawLine = function( start, end, color, width ) {
	var s = {x: ig.system.getDrawPos(start.x - ig.game._rscreen.x), y: ig.system.getDrawPos(start.y - ig.game._rscreen.y) };
	var e = {x: ig.system.getDrawPos(end.x - ig.game._rscreen.x), y: ig.system.getDrawPos(end.y - ig.game._rscreen.y) };

	var ctx = ig.system.context;
	ctx.beginPath();
	ctx.moveTo( s.x, s.y );
	ctx.lineTo( e.x, e.y );
	ctx.lineWidth = width * ig.system.scale;
	ctx.strokeStyle = color;
	ctx.lineCap = 'round';
	ctx.stroke();
},

ig.util.drawAliasedLine = function( start, end, color, width ) {
	var s = {x: ig.system.getDrawPos(start.x - ig.game._rscreen.x), y: ig.system.getDrawPos(start.y - ig.game._rscreen.y) };
	var e = {x: ig.system.getDrawPos(end.x - ig.game._rscreen.x), y: ig.system.getDrawPos(end.y - ig.game._rscreen.y) };

	ig.system.context.fillStyle = color;
	var distance = Math.floor( ig.v2.dist(s, e) );
	for (var i = 0; i < distance; i += ig.system.scale) {
		var delta = (i / distance);
		var pos = ig.v2.lerp(s, e, delta);
		ig.system.context.fillRect(pos.x, pos.y, ig.system.scale, ig.system.scale);
	}
};

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			size++;
		}
	}
	return size;
};

});
