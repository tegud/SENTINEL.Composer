var _ = require('lodash');


function getUserTypeFromLastRequest(lastRequest) {
	if(lastRequest.UA_is_bot == "true") {
		return 'GoodBot';
	}

	if(lastRequest.botBuster_score != "0") {
		return 'BadBot';
	}

	return 'Human';
}

module.exports = function(sessionLog) {
	var lastRequest = _.chain(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; }).last().value();

	if(!lastRequest) {
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
		type: getUserTypeFromLastRequest(lastRequest)
	};
};
