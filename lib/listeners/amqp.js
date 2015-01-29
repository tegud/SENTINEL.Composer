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

		connection.queue('composer-in', { autoDelete: false }, queueReady.bind(undefined, handleMessage, resolve));
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
		var connection = amqp.createConnection({ host: config.host });

		connection.on('ready', connectionReady.bind(undefined, handleMessage, resolve, reject));
	}

	function start() {
		return new Promise(startUp);
	}

	return {
		start: start
	};
};