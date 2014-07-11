var server = require('./server');

new server({
	listenOnPort: 112,
	emitOnPort: 114
}).start();
