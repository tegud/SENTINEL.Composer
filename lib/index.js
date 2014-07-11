var server = require('./server');

new server({
	listenOnPort: 113,
	emitOnPort: 114
}).start();
