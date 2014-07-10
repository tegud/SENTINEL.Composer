var Promise = require('bluebird');
var dgram = require("dgram");
var memoryStore = require('./memoryStore');
var _ = require('lodash');

module.exports = function(config) {
	var udpClient;
	var refresh;
	var refreshRate = config.refreshRate || 500;
	var expiredCheckTimeout;

	function checkForExpiredSessions(udpClient, options) {
		var expiredSessions = memoryStore.getAndRemoveExpired();


		expiredSessions.forEach(function(session) {
			var message = new Buffer(JSON.stringify({
				sessionId: session.sessionId,
				errors: _.filter(session.events, function(item) { return item.type === 'lr_errors' }).length,
				booked: _.filter(session.events, function(item) { return item.type === 'domain_events' }).length > 0
			}));

			udpClient.send(message, 0, message.length, options.port, "localhost", function() { });
		});

		expiredCheckTimeout = setTimeout(refresh, options.refreshRate);
	}

	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				udpClient = dgram.createSocket("udp4");

				refresh = checkForExpiredSessions.bind(undefined, udpClient, {
					refreshRate: refreshRate, 
					port: config.emitOnPort
				});

				udpClient.on("error", function (err) {
					console.log("server error:\n" + err.stack);
				});

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(!parsedData.sessionId) {
						return;
					}

					memoryStore.trackSession(parsedData.sessionId, parsedData);
				});

				udpClient.on("listening", resolve);

				udpClient.bind(config.listenOnPort);

				expiredCheckTimeout = setTimeout(refresh, refreshRate);
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				udpClient.close();
				clearTimeout(expiredCheckTimeout);

				resolve();
			});
		}
	};
};