var _ = require('lodash');

function getPartnerCode(request) {
	return request.resp_headers ? request.resp_headers.x_log_partner : 'NOPARTNERCODE';
}

function logPartnerCodeChanges(requests) {
	var last;
	var distinct = [];
	requests.forEach(function (request) {
		var key = getPartnerCode(request);
		if (last !== key) {
			distinct.push(key);
			last = key;
		}
	});
	return distinct;
}

function checkIfPartnerCodeHasChanged(requests) {
	if (requests.length < 2) {
		return false;
	}
	var previousKey = getPartnerCode(requests[requests.length - 2]);
	var currentKey = getPartnerCode(requests[requests.length - 1]);

	return previousKey !== currentKey;
}

module.exports = function (sessionLog) {
	var partnerJourneyRequests = _.filter(sessionLog.events, function (item) {
		return item.type === 'lr_varnish_request';
	});

	if (!partnerJourneyRequests.length) {
		return {};
	}

	var partnerCodes = logPartnerCodeChanges(partnerJourneyRequests);

	var partnerCodeChanged = checkIfPartnerCodeHasChanged(partnerJourneyRequests);

	var partnerJourney = {
		partnerCodeOrder: partnerCodes.join(),
		partnerCodeNumber: partnerCodes.length,
		partnerCodeChanged: partnerCodeChanged
	};

	return partnerJourney;
};
