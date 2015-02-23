var _ = require('lodash');

function getPartnerCode(request) {
	return (request.resp_headers ?
		request.resp_headers.X_LOG_Partner : undefined) || 'NOPARTNERCODE';
}

function getPartnerCodes(requests) {
	var previous;
	var pcodes = [];
	requests.forEach(function (request) {
		var current = getPartnerCode(request).replace('partner=', '').replace('&partnervalue=', '-');
		if (previous !== current) {
			pcodes.push({
				pcode: current,
				url: request.url_path
			});
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
	var requests = _.filter(sessionLog.events, function (request) {
		return request.type === 'lr_varnish_request' &&
			!request.url_path.match(/(\/autocomplete\/|\/rates\/|\/ajax|\/beacon\/)/i);
	});

	if (!requests.length) {
		return {};
	}

	var partnerCodes = getPartnerCodes(requests);
	return {
		order: _.map(partnerCodes, 'pcode').join(),
		number: partnerCodes.length,
		changed: hasPartnerCodeChanged(requests),
		urls: _.map(partnerCodes, 'url').join()
	};
};
