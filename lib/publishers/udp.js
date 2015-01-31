var Promise = require('bluebird');
var dgram = require("dgram");

module.exports = function() {
	var udpClient;
	
	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				udpClient = dgram.createSocket("udp4");

				resolve();
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				udpClient.close();

				resolve();
			});
		},
		publish: function() {

		}
	};
};
