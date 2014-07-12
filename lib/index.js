var server = require('./server');

new server({
	listenOnPort: 2057,
	emitOnPort: 2058,
	memoryStore: {
		maxInactivityUnits: 'minutes',
		maxInactivity: 15
	}
}).start();
