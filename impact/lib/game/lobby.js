ig.module(
	'game.lobby'
)
.requires(
	'game.main',
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
						this.connectToHost(xhr.response);
					}
				}
			}.bind(this);

			xhr.open('GET', 'http://' + ig.net.getServerAddr() + '/get_available_game', true);
			xhr.send();
		}
		else if( this.connectedState == Lobby.ConnectionState.WAITINGFORPARTNER ) {
			if( Object.size(ig.net.connections) > 0 ) {
				this.connectedState = Lobby.ConnectionState.CONNECTEDTOPARTNER;

				ig.system.setGame( MyGame );
			}
		}

		this.parent();
	},

	draw: function() {
		this.parent();

		var c_x = ig.system.width / 2,
			c_y = ig.system.height / 2;
		switch( this.connectedState ) {
			case Lobby.ConnectionState.UNCONNECTED:
				this.font.draw('Connecting to Multiplayer Server', c_x, c_y, ig.Font.ALIGN.CENTER);
				break;
			case Lobby.ConnectionState.PEERJSCONNECTED:
				this.font.draw('Searching for open games', c_x, c_y, ig.Font.ALIGN.CENTER);
				break;
			case Lobby.ConnectionState.WAITINGFORPARTNER:
				if( ig.net.isHost() ) {
					this.font.draw('Hosting Game... waiting for partner', c_x, c_y, ig.Font.ALIGN.CENTER);
				} else {
					this.font.draw('Joining Game... connecting to partner', c_x, c_y, ig.Font.ALIGN.CENTER);
				}
				break;
			case Lobby.ConnectionState.CONNECTEDTOPARTNER:
				this.font.draw('Connected to partner... starting game.', c_x, c_y, ig.Font.ALIGN.CENTER);
				break;
		}
	},

	hostGame: function() {
		console.log('Hosting game');
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					ig.net.hostGame();
					this.connectedState = Lobby.ConnectionState.WAITINGFORPARTNER;
				}
				else {
					console.log('ERROR: Unable to host [' + xhr.status + ']');
				}
			}
		}.bind(this);

		xhr.open('GET', 'http://' + ig.net.getServerAddr() + '/host_game/' + ig.net.peerId, true);
		xhr.send();
	},

	connectToHost: function( hostId ) {
		console.log('Joining game ' + hostId);

		ig.net.joinGame( hostId );

		this.connectedState = Lobby.ConnectionState.WAITINGFORPARTNER;
	}
});

Lobby.ConnectionState = {
	UNCONNECTED: 0,
	PEERJSCONNECTED: 1,
	WAITINGFORPARTNER: 2,
	CONNECTEDTOPARTNER: 3,
}

});
