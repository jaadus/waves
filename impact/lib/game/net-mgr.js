ig.module(
	'game.net-mgr'
)
.requires(
	'impact.impact'
)
.defines(function(){

function processPacket(conn) {
	return function(data) {
		if( data.type == 'ent' ) {
			var ent = ig.game.getEntityById( data.id );
			if( ent && ent.processPacket ) {
				ent.processPacket( data.msg );
			}
			return;
		}

		ig.game.processPacket(data, conn);
	};
}


NetMgr = ig.Class.extend({
	peer: null,
	peerId: '',
	hostId: '',

	server: { host: '73.162.188.20', port: 1701 },
	connections: {},

	login: function( name ) {
		this.peer = new Peer(name, this.server);
		this.peer.on('open', function(id) {
			this.peerId = id;
			console.log('My peer ID is: ' + id);
		}.bind(this));

		this.peer.on('connection', function( conn ) {
			console.log('Receiving connection from: ' + conn.peer);
			this.setupConnection( conn );
		}.bind(this));
	},

	setupConnection: function( conn ) {
		this.connections[conn.peer] = conn;

		conn.on('data', processPacket( conn ) );
		conn.on('close', function() {
			console.log('Connection to ' + conn.peer + ' closed');
			var connectedPlayers = Object.keys(ig.net.connections);
			for( var i = 0; i < connectedPlayers.length; ++i ) {
				if( connectedPlayers[i] == conn.peer ) {
					delete this.connections[connectedPlayers[i]];
					break;
				}
			}

			if( ig.game.processClose ) {
				ig.game.processClose( conn );
			}
		}.bind(this));

		if( ig.game.processConnection ) {
			ig.game.processConnection( conn );
		}
	},

	hostGame: function() {
		this.hostId = this.peerId;

		/*var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				if (this.status == 201) {
					this.hostId = this.peerId;
				}
				else if (this.status == 205) {
					this.hostId = '';
				}
			}
		}.bind(this);
		xhr.open('POST', 'http://' + this.server.host + ":" + this.server.port + '/peerjs/' + this.peerId + '/host', true);
		xhr.send();*/
	},

	isHost: function() {
		return this.hostId == this.peerId;
	},

	joinGame: function( hostId ) {
		this.hostId = hostId;

		var conn = this.peer.connect( hostId, {reliable: true} );
		this.setupConnection( conn );
	},

	connectTo: function( peerId ) {
		var conn = this.peer.connect( peerId, {reliable: true} );
		this.setupConnection( conn );
	},

	sendToHost: function(data) {
		if (this.hostId != this.peerId) {
			this.connections[this.hostId].send(data);
		}
		else {
			ig.game.processPacket(data, null);
		}
	},

	sendToClients: function(data) {
		var connectionKeys = Object.keys(this.connections);
		for (var i = 0; i < connectionKeys.length; ++i) {
			var conn = this.connections[connectionKeys[i]];
			if (conn.open)
				conn.send(data);
		}
	},

	sendToAll: function(data) {
		this.sendToClients(data);

		var processFunc = processPacket(null);
		processFunc(data);
	},

	sendTo: function(peer, data) {
		this.connections[peer].send(data);
	}
});

ig.net = new NetMgr();

});
