var server = require('./server');

new server({
	listenOnPort: 2056,
	emitOnPort: 2057,
	memoryStore: {
		maxInactivityUnits: 'minutes',
		maxInactivity: 15
	}
}).start();
