var _ = require('lodash');
var moment = require('moment');

module.exports = function(logEntries) {
	return {
		type: 'cross_application_request'
	};
};
