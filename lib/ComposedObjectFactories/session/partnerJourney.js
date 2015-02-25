var _ = require('lodash');
var noPartnerCode = 'NOPARTNERCODE';

function getPartnerCode(request) {
	return (request.resp_headers ?
		request.resp_headers.X_LOG_Partner : undefined) || noPartnerCode;
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

function findFirstValidPartnerCode(partnerCodes) {
	return _.result(_.find(partnerCodes, function (item) {
		return item.pcode !== noPartnerCode
	}), 'pcode');
}

function findLastValidPartnerCode(partnerCodes) {
	return _.result(_.findLast(partnerCodes, function (item) {
		return item.pcode !== noPartnerCode
	}), 'pcode');
}

module.exports = function (sessionLog) {
	var requests = _.filter(sessionLog.events, function (request) {
		return request.type === 'lr_varnish_request' &&
			request.url_path !== undefined &&
			!request.url_path.match(/(\/autocomplete|\/rates|\/ajax|\/beacon|\/checkpage|autoc.php|\/poi)/i);
	});

	if (!requests.length) {
		return {};
	}

	var partnerCodes = getPartnerCodes(requests);
	return {
		changed: hasPartnerCodeChanged(requests),
		number: partnerCodes.length,
		order: _.map(partnerCodes, 'pcode').join(),
		first: findFirstValidPartnerCode(partnerCodes),
		last: findLastValidPartnerCode(partnerCodes),
		urls: _.map(partnerCodes, 'url').join()
	};
};
