ig.module(
	'game.math'
)
.requires()
.defines(function(){

ig.math = {}

ig.math.clamp = function(val, min, max) {
	return Math.min(Math.max(val, min), max);
};

ig.math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

ig.math.rlerp = function (value1, value2, final) {
	var delta = (value2 - value1);
	if( delta == 0)
		return 0;

	return (final - value1) / delta;
};

ig.math.easeOutSine = function (start, end, time, duration) {
	return (end - start) * Math.sin(time / duration * (Math.PI/2)) + start;
};

ig.math.easeOutCirc = function (start, end, time, duration) {
	return (end - start) * Math.sqrt(1 - (time=time/duration-1)*time) + start;
};

ig.math.easeInOutSine = function (start, end, time, duration) {
	return -(end - start) / 2 * (Math.cos(Math.PI * time / duration) - 1) + start;
};

});
