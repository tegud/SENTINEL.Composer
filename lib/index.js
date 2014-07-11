var server = require('./server');

new server({
	listenOnPort: 2056,
	emitOnPort: 2057
}).start();
