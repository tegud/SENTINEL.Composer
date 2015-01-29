var Promise = require('bluebird');
var amqp = require('amqp');
var logger = require('../logging');

module.exports = function UdpListener(config, handleMessage) {
	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				var connection = amqp.createConnection({ host: config.host });
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

						resolve();
					});
				});
			});
		}
	};
};
