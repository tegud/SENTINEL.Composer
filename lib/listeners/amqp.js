var Promise = require('bluebird');
var amqp = require('amqp');
var logger = require('../logging');

module.exports = function AmqpListener(config, handleMessage) {
	var connection;
	var connected;

	function connectionReady(handleMessage, resolve, reject, connection) {
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
		
		queue.subscribe({ ack: true }, messageReceived.bind(undefined, handleMessage, queue));

		resolve();
	}

	function messageReceived(handleMessage, queue, msg) {
		handleMessage(msg.data);
		queue.shift();
	}

	function startUp(resolve, reject) {
		var connection = amqp.createConnection({ host: config.host });

		connection.on('ready', connectionReady.bind(undefined, handleMessage, resolve, reject, connection));
	}

	function start() {
		return new Promise(startUp);
	}

	return {
		start: start
	};
};
