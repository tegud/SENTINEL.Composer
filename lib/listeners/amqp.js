var Promise = require('bluebird');
var amqp = require('amqp');
var logger = require('../logging');

module.exports = function AmqpListener(config, handleMessage) {
	var connection;
	var connected;

	function connectionReady(handleMessage, resolve) {
		if(connected) { 
			return;
		}

		connected = true;
		logger.logInfo('Connected to Rabbit MQ');

		// connection.queue('composer-in', { autoDelete: false }, function(queue) { queueReady(handleMessage, resolve, queue); });

		connection.queue('composer-in', { autoDelete: false }, function(queue){
			logger.logInfo('Connected to Queue');
			queue.bind('composer', 'composer');
			
			queue.subscribe(function(msg) {
				handleMessage(msg.data);
			});
		});
	}

	function queueReady(handleMessage, resolve, queue) {
		logger.logInfo('Connected to Queue');
		
		queue.bind('composer', 'composer');
		
		queue.subscribe(messageReceived.bind(undefined, handleMessage));

		resolve();
	}

	function messageReceived(handleMessage, msg) {
		handleMessage(msg.data);
	}

	function startUp(resolve, reject) {
		var connection = amqp.createConnection({host: '172.31.164.123'});
		
		connection.on('ready', connectionReady);
	}

	function start() {
		return new Promise(startUp);
	}

	return {
		start: start
	};
};
