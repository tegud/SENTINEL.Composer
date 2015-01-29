var Promise = require('bluebird');
var dgram = require("dgram");
var logger = require('../logging');

module.exports = function UdpListener(config, handleMessage) {
	var udpClient = dgram.createSocket("udp4");

	function onError(error) {
		console.log("server error:\n" + error.stack);
	}

	function startedListening(resolve) {
		logger.logInfo("Listening on port: " + config.port);

		resolve();
	}

	function startUp(resolve, reject) {
		udpClient.on("error", onError);
		udpClient.on("message", handleMessage);
		udpClient.on("listening", startedListening.bind(undefined, resolve));

		udpClient.bind(config.port);
	}

	function shutDown(resolve, reject) {
		logger.logInfo("Stopping listening on port: " + config.port);
		udpClient.close();

		resolve();
	}

	function start() { 
		return new Promise(startUp); 
	}

	function stop() { 
		return new Promise(shutDown); 
	}

	return {
		start: start,
		stop: stop
	}
};
