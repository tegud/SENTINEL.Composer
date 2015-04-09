var _ = require('lodash');

module.exports = function(sessionLog) {
	var paymentProcessorEvents = _.filter(sessionLog.events, function(item) { return item.type === 'paymentprocessor_logging'; });

	return {
		tokeniser: paymentProcessorEvents.length > 0 ? 'paymentprocessor' : 'ipg'
	};
}