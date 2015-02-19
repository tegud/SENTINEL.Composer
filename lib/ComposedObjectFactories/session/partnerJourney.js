var _ = require('lodash');

function uniqueInOrder(array, fn) {
	var last;
	var distinct = [];
	array.forEach(function (x) {
		var key = fn(x);
		if (key !== undefined && last !== key) {
			distinct.push(key);
			last = key;
		}
	});
	return distinct.join(', ');
}

module.exports = function (sessionLog) {
	var partnerJourneyRequests = _.filter(sessionLog.events, function (item) {
		return item.type === 'lr_varnish_request';
	});

	if (!partnerJourneyRequests.length) {
		return {};
	}
	var partnerJourney = {};

	partnerJourney.partnerCodes = uniqueInOrder(partnerJourneyRequests, function (request) {
		if (!request.resp_headers) return undefined;
		return request.resp_headers.x_log_partner;
	});

	return partnerJourney;
};
