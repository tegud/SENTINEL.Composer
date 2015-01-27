var _ = require('lodash');

module.exports = function(sessionLog) {
	var errors = _.filter(sessionLog.events, function(item) { return item.type === 'lr_errors'; });
	var lastError = _.clone(_.last(errors));
	var sessionErrorDetails = {
		total: errors.length
	};

	if(lastError && lastError.Exception) {
		var lastRequest = _.chain(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; }).last().value();
		var isLastRequest = (lastRequest && lastRequest.requestId === lastError.requestId) || false;

		sessionErrorDetails.lastError = {
			message: lastError.Exception.Message,
			exceptionMethod: lastError.Exception.ExceptionMethod,
			wasLastRequest: isLastRequest,
			requestId: lastError.requestId
		};
	}

	return sessionErrorDetails;
};
