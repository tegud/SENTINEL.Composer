var Promise = require('bluebird');
var dgram = require("dgram");
var logger = require('../logging');

module.exports = function UdpListener(config, handleMessage) {
	var udpClient = dgram.createSocket("udp4");

	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				udpClient.on("error", function (err) {
					console.log("server error:\n" + err.stack);
				});

				udpClient.on("message", handleMessage);

				udpClient.on("listening", function() {
					logger.logInfo("Listening on port: " + config.port);

					resolve();
				});

				udpClient.bind(config.port);
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				logger.logInfo("Stopping listening on port: " + config.port);

				udpClient.close();
				resolve();
			});
		}
	}
};
