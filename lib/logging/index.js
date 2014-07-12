var moment = require('moment');

var availableLevels = {
	'DEBUG': 0,
	'INFO': 1,
	'ERROR': 2
};

var logLevel = 'INFO';

function log(level, message) {
	if(availableLevels[level] >= availableLevels[logLevel]) {
		console.log('[' + moment().format('HH:mm:ss') + '] [' + level + '] ' + message);
	}
}

module.exports = {
	DEBUG: 'DEBUG',
	INFO: 'INFO',
	ERROR: 'ERROR',
	setLevel: function(level) {
		logLevel = level;
	},
	log: log,
	logDebug: function(message) {
		log('DEBUG', message);
	},
	logInfo: function(message) {
		log('INFO', message);
	},
	logError: function(message) {
		log('ERROR', message);
	}
};
