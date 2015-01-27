var _ = require('lodash');


function getUserTypeFromLastRequest(requests) {
	if(_.some(requests, function(request) { return request.UA_is_bot == "true"; })) {
		return 'GoodBot';
	}

	if(_.some(requests, function(request) { return typeof request.botBuster_score !== "undefined" && request.botBuster_score != "0"; })) {
		return 'BadBot';
	}

	return 'Human';
}

module.exports = function(sessionLog) {
	var requests = _.filter(sessionLog.events, function(item) { return item.type === 'lr_varnish_request'; });
	var lastRequest = _.last(requests);

	if(!requests.length) {
		return;
	}

	var geoIpInfo = lastRequest["geoip"] ? JSON.parse(JSON.stringify(lastRequest["geoip"])) : {};

	delete geoIpInfo['ip'];

	return {
		ip: {
			address: lastRequest["ip"],
			organisation: lastRequest["organisation"],
			geoip: geoIpInfo
		},
		userAgent: {
			full: lastRequest['req_headers']['User_Agent'],
			name: lastRequest['UA_name'],
			os: lastRequest['UA_os'],
			osName: lastRequest['UA_os_name'],
			device: lastRequest['UA_device'],
			major: lastRequest['UA_major'],
			minor: lastRequest['UA_minor']
		},
		type: getUserTypeFromLastRequest(requests)
	};
};
