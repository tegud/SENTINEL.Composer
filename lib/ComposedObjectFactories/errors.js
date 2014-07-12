var _ = require('lodash');

module.exports = function(sessionLog) {
	var errors = _.filter(sessionLog.events, function(item) { return item.type === 'lr_errors'; });
	return {
		total: errors.length
	};
};
