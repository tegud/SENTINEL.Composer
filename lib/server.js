var Promise = require('bluebird');
var dgram = require("dgram");
var _ = require('lodash');
var MemoryStore = require('./memoryStore');
var logger = require('./logging');
var allListeners = require('./listeners');

module.exports = function(config) {
	var udpClient;
	var refresh;
	var refreshRate = config.refreshRate || 500;
	var expiredCheckTimeout;
	var aggregators = config.aggregators;
	var listeners = _.map(config.listeners, function(config) {
		return new allListeners[config.type](config, handleMessage);
	});

	if(config.logLevel) {
		logger.setLevel(config.logLevel);
	}

	aggregators.forEach(function(aggregator) {
		var memoryStore = new MemoryStore();

		if(aggregator.memoryStore) {
			memoryStore.configure(aggregator.memoryStore);
		}

		aggregator.store = memoryStore;
		aggregator.factory = require('./ComposedObjectFactories/' + aggregator.factory);
	});

	function checkForExpiredSessions(udpClient, options) {
		aggregators.forEach(function(aggregator) {
			var expiredSessions = aggregator.store.getAndRemoveExpired();
			
			expiredSessions.forEach(function(session) {
				var builtObject = aggregator.factory(session); 
				var message = new Buffer(JSON.stringify(builtObject));

				udpClient.send(message, 0, message.length, options.port, "10.44.72.43", function() { });
			});

		});

		expiredCheckTimeout = setTimeout(refresh, options.refreshRate);
	}

	function parseMessage(msg) {
		var data = msg.toString('utf-8');

		return JSON.parse(data);
	}

	function handleMessage(msg) {
		var parsedData = parseMessage(msg);

		aggregators.forEach(function(aggregator) {
			var key = aggregator.keyFunction(parsedData);
			if(key && _.contains(aggregator.subscribedTypes, parsedData.type)) {
				aggregator.store.trackSession(key, parsedData);
			}
		});
	}

	return {
		start: function() {
			logger.logInfo('Initialising SENTINEL.Composer.');

			return new Promise(function(resolve, reject) {
				udpClient = dgram.createSocket("udp4");

				refresh = checkForExpiredSessions.bind(undefined, udpClient, {
					refreshRate: refreshRate, 
					port: config.emitOnPort
				});

				var listenerStartPromises = _.map(listeners, function(listener) {
					return listener.start();
				});

				Promise.all(listenerStartPromises).then(function() {
					resolve();
				});

				expiredCheckTimeout = setTimeout(refresh, refreshRate);
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				clearTimeout(expiredCheckTimeout);

				var listenerStopPromises = _.chain(listeners).map(function(listener) {
					if(!listener.stop) {
						return;
					}

					return listener.stop();
				}).filter(function(listener) { return listener; }).value();

				udpClient.close();

				Promise.all(listenerStopPromises).then(function() { resolve(); });
			});
		}
	};
};
