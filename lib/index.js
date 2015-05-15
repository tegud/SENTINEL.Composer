var server = require('./server');

new server({
	listeners: [
		{ type: 'udp', port: 2057 },
		{ type: 'amqp', host: '10.44.72.40' }
	],
	emitOnPort: 2058,
	emitToHost: '10.44.72.43',
	aggregators: [
		{
			type: 'session',
			subscribedTypes: ['lr_varnish_request', 'domain_events', 'lr_errors', 'paymentprocessor_logging'],
			keyFunction: function(data) { return data['sessionId'] || (data['data'] == undefined ? undefined : data['data']['TLRGSessionId']); },
			factory: 'session',
			memoryStore: {
				maxInactivityUnits: 'minutes',
				maxInactivity: 15
			}
		}
		// ,
		// {
		// 	type: 'cross_application_request',
		// 	subscribedTypes: ['lr_varnish_request', 'ms_logging', 'ms_errors', 'hotels_acquisitions_errors', 'hotels_acquisitions_request', 'hotel_acquisitions_errors', 'api_varnish', 'hotel_api_errors'],
		// 	keyFunction: function(data) { return data['crossApplicationRequestId']; },
		// 	factory: 'crossApplicationRequest',
		// 	memoryStore: {
		// 		maxInactivityUnits: 'seconds',
		// 		maxInactivity: 30
		// 	}
		// }
	]
}).start();
