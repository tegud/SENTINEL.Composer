var server = require('./server');

new server({
	listenOnPort: 2057,
	emitOnPort: 2058,
	memoryStore: {
		maxInactivityUnits: 'minutes',
		maxInactivity: 15
	},
	aggregators: [
		{
			type: 'session',
			subscribedTypes: ['lr_varnish_request', 'domain_events', 'lr_errors'],
			keyProperty: 'sessionId',
			factory: 'session',
			memoryStore: {
				maxInactivityUnits: 'minutes',
				maxInactivity: 15
			}
		},
		{
			type: 'cross_application_request',
			subscribedTypes: ['lr_varnish_request', 'ms_logging', 'ms_errors', 'hotels_acquisitions_errors', 'api_varnish', 'hotel_api_errors'],
			keyProperty: 'crossApplicationRequestId',
			factory: 'crossApplicationRequest',
			memoryStore: {
				maxInactivityUnits: 'minutes',
				maxInactivity: 3
			}
		}
	]
}).start();
