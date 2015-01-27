var Promise = require('bluebird');
var dgram = require("dgram");
var amqp = require('amqp');
var _ = require('lodash');
var MemoryStore = require('./memoryStore');
var logger = require('./logging');

module.exports = function(config) {
	var udpClient;
	var refresh;
	var refreshRate = config.refreshRate || 500;
	var expiredCheckTimeout;

	var aggregators = [
		{
			type: 'session',
			subscribedTypes: ['lr_varnish_request', 'domain_events', 'lr_errors'],
			store: new MemoryStore(),
			keyProperty: 'sessionId',
			factory: require('./ComposedObjectFactories/session')
		},
		{
			type: 'cross_application_request',
			subscribedTypes: ['lr_varnish_request', 'ms_logging', 'ms_errors', 'hotels_acquisitions_errors', 'api_varnish', 'hotel_api_errors'],
			store: new MemoryStore(),
			keyProperty: 'crossApplicationRequestId',
			factory: require('./ComposedObjectFactories/crossApplicationRequest')
		}
	];

	if(config.logLevel) {
		logger.setLevel(config.logLevel);
	}

	aggregators.forEach(function(aggregator) {
		if(config.memoryStore) {
			aggregator.store.configure(config.memoryStore);
		}
	});

	function checkForExpiredSessions(udpClient, options) {
		aggregators.forEach(function(aggregator) {
			var expiredSessions = aggregator.store.getAndRemoveExpired();
			
			expiredSessions.forEach(function(session) {
				var builtObject = aggregator.factory(session); 
				var message = new Buffer(JSON.stringify(builtObject));

				udpClient.send(message, 0, message.length, options.port, "localhost", function() { });
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
			if(parsedData[aggregator.keyProperty]) {
				aggregator.store.trackSession(parsedData[aggregator.keyProperty], parsedData);
			}
		});
	}

	function log(message) {
		console.log('[' + moment().format('HH:mm:ss') + '] ' + message);
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

				var connection = amqp.createConnection({host: '172.31.164.123'});
				var connected;

				connection.on('ready', function(){
					if(connected) { 
						return;
					}

					connected = true;
					logger.logInfo('Connected to Rabbit MQ');

					connection.queue('composer-in', { autoDelete: false }, function(queue){
						logger.logInfo('Connected to Queue');
						queue.bind('composer', 'composer');
						
						queue.subscribe(function(msg) {
							handleMessage(msg.data);
						});
					});
				});

				udpClient.on("error", function (err) {
					console.log("server error:\n" + err.stack);
				});

				udpClient.on("message", handleMessage);

				udpClient.on("listening", function() {
					logger.logInfo('Initialisation Complete.')

					resolve();
				});

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
