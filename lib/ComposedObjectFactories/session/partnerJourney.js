var _ = require('lodash');

function logPartnerCodeChanges(requests) {
	var last;
	var distinct = [];
	requests.forEach(function (request) {
		var key = request.resp_headers ? request.resp_headers.x_log_partner : 'NOPARTNERCODE';
		if (last !== key) {
			distinct.push(key);
			last = key;
		}
	});
	return distinct;
}

module.exports = function (sessionLog) {
	var partnerJourneyRequests = _.filter(sessionLog.events, function (item) {
		return item.type === 'lr_varnish_request';
	});

	if (!partnerJourneyRequests.length) {
		return {};
	}

	var partnerCodes = logPartnerCodeChanges(partnerJourneyRequests);

	var request = {
		partnerCodeOrder: partnerCodes.join(', '),
		partnerCodeNumber: partnerCodes.length
	};

	return request;
};
