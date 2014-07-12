var _ = require('lodash');

function buildBookingDetails(bookingEvent) {
	if (!bookingEvent) {
		return;
	}

	return {
		isTestBooking: bookingEvent.isTestBooking,
		rooms: bookingEvent.rooms,
		nights: bookingEvent.nights,
		roomNights: bookingEvent.rooms * bookingEvent.nights,
		hotel: {
			id: bookingEvent.hotelId,
			provider: bookingEvent.hotelProvider
		},
		affiliate: {
			id: bookingEvent.affiliateId,
			name: bookingEvent.affiliateName
		},
		totalAmountGbp: bookingEvent.totalAmountGbp,
		commission: {
			percent: bookingEvent.commission,
			value: bookingEvent.commissionValue
		},
		channel: {
			id: bookingEvent.channelId
		}
	};
}

function getUserTypeFromLastRequest(lastRequest) {
	if(lastRequest.UA_is_bot == "true") {
		return 'GoodBot';
	}

	if(lastRequest.botBuster_score != "0") {
		return 'BadBot';
	}

	return 'Human';
}

function buildUser(sessionLog) {
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
}

function buildRequests(sessionLog) {
	var requests = _.filter(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; });
	var lastRequest = _.chain(requests).filter(function(item) {
		if(item.url_page_type === 'home' 
			|| item.url_page_type === 'search' 
			|| item.url_page_type === 'hotel-details' 
			|| item.url_page_type === 'booking') {
			return true;
		}
	}).last().value();

	return {
		total: requests.length,
		funnelExitedAt: lastRequest.url_page_type
	};
}

function buildErrors(sessionLog) {
	var errors = _.filter(sessionLog.events, function(item) { return item.type === 'lr_errors'; });
	return {
		total: errors.length
	};
}

module.exports = function(sessionLog) {
	var bookingEvent = _.chain(sessionLog.events).filter(function(item) { 
			return item.type === 'domain_events' && item.domainEventType === "booking made"; 
		}).first().value();
	var user = buildUser(sessionLog);
	var lastEvent = _.last(sessionLog.events);

	return {
		sessionId: sessionLog.sessionId,
		type: 'session',
		'@timestamp': lastEvent['@timestamp'],
		errors: buildErrors(sessionLog),
		booked: bookingEvent ? true : false,
		user: user,
		bookingDetails: buildBookingDetails(bookingEvent),
		requests: buildRequests(sessionLog)
	};
};
