ig.module(
	'game.v2'
)
.requires(
	'game.math'
)
.defines(function(){

ig.v2 = {}

ig.v2.add = function( a, b ) {
	return { x: a.x + b.x, y: a.y + b.y };
};

ig.v2.sub = function( a, b ) {
	return { x: a.x - b.x, y: a.y - b.y };
};

ig.v2.dist = function( a, b ) {
	var dx = b.x - a.x;
	var dy = b.y - a.y;
	return Math.sqrt(dx * dx + dy * dy);
};

ig.v2.length = function( vec ) {
	return Math.sqrt( vec.x * vec.x + vec.y * vec.y );
};

ig.v2.setlength = function( vec, len ) {
	ig.v2.normalize( vec );
	vec.x *= len;
	vec.y *= len;
};

ig.v2.normalize = function( vec ) {
	var len = ig.v2.length( vec );
	if( len == 0 ) { return; }
	vec.x /= len;
	vec.y /= len;
};

ig.v2.lerp = function( start, end, t ) {
	return { x: ig.math.lerp( start.x, end.x, t ), y: ig.math.lerp( start.y, end.y, t ) };
};

});
