var Promise = require('bluebird');
var dgram = require("dgram");
var memoryStore = require('./memoryStore');


module.exports = function(config) {
	var udpClient;

	function checkForExpiredSessions() {
		var expiredSessions = memoryStore.getAndRemoveExpired();

		expiredSessions.forEach(function(session) {

			var message = new Buffer(JSON.stringify(session));

			udpClient.send(message, 0, message.length, 1235, "localhost", function() { });
		});

		setTimeout(checkForExpiredSessions, 500);
	}

	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				udpClient = dgram.createSocket("udp4");

				udpClient.on("error", function (err) {
					console.log("server error:\n" + err.stack);
				});

				udpClient.on("message", function messageReceived(msg, rinfo) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(!parsedData.sessionId) {
						return;
					}

					memoryStore.trackSession(parsedData.sessionId, parsedData);
				});

				udpClient.on("listening", resolve);

				udpClient.bind(config.listenOnPort);

				setTimeout(checkForExpiredSessions, 500);
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				udpClient.close();

				resolve();
			});
		}
	};
};
