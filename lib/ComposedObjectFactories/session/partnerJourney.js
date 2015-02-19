var _ = require('lodash');

function getPartnerCode(request) {
	return request.resp_headers ?
		request.resp_headers.x_log_partner : 'NOPARTNERCODE';
}

function getPartnerCodes(requests) {
	var previous;
	var pcodes = [];
	requests.forEach(function (request) {
		var current = getPartnerCode(request);
		if (previous !== current) {
			pcodes.push(current);
			previous = current;
		}
	});
	return pcodes;
}

function hasPartnerCodeChanged(requests) {
	if (requests.length < 2) {
		return false;
	}
	var previous = getPartnerCode(requests[requests.length - 2]);
	var current = getPartnerCode(requests[requests.length - 1]);

	return previous !== current;
}

module.exports = function (sessionLog) {
	var requests = _.filter(sessionLog.events, function (item) {
		return item.type === 'lr_varnish_request';
	});

	if (!requests.length) {
		return {};
	}

	var partnerCodes = getPartnerCodes(requests);
	return {
		partnerCodeOrder: partnerCodes.join(),
		partnerCodeNumber: partnerCodes.length,
		partnerCodeChanged: hasPartnerCodeChanged(requests)
	};
};
