ig.module(
	'game.lobby'
)
.requires(
	'game.net-mgr',
	'game.util',
	'game.v2',

	'impact.game',
	'impact.font'
)
.defines(function(){

Lobby = ig.Game.extend({

	clearColor: '#000',
	font: new ig.Font( 'media/04b03.font.png' ),

	connectedState: 0,

	init: function() {
		this.connectedState = Lobby.ConnectionState.UNCONNECTED;

		ig.net.login();
	},

	update: function() {
		if( this.connectedState == Lobby.ConnectionState.UNCONNECTED && ig.net.peerId ) {
			this.connectedState = Lobby.ConnectionState.PEERJSCONNECTED;

			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (xhr.status == 418) {
						console.log(xhr.response);
						this.hostGame();
					}
					else if (xhr.status == 200) {
						console.log(xhr.response);
						// TODO: Host found, connect!
					}
				}
			}.bind(this);

			xhr.open('GET', 'http://' + ig.net.getServerAddr() + '/get_available_game', true);
			xhr.send();
		}
		// Update all entities and backgroundMaps
		this.parent();

		// Add your own, additional update code here
	},

	hostGame: function() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					this.connectedState = Lobby.ConnectionState.SEARCHINGFORPARTNER;
				}
				else {
					console.log('ERROR: Unable to host [' + xhr.status + ']');
				}
			}
		}.bind(this);

		xhr.open('POST', 'http://' + ig.net.getServerAddr() + '/host_game', true);
		xhr.send({'peerId': ig.net.peerId});
	},

	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});

Lobby.ConnectionState = {
	UNCONNECTED: 0,
	PEERJSCONNECTED: 1, // State 1 for ANY player
	WAITINGFORPARTNER: 2, // State 2 for hosts
	SEARCHINGFORPARTNER: 3, // State 2 for clients
	CONNECTEDASHOST: 4, // State 3 for hosts
	CONNECTEDASCLIENT: 5 // State 3 for clients
}

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', Lobby, 60, 400, 300, 2 );

});
