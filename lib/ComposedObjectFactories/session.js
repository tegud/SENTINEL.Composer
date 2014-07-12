var _ = require('lodash');

var buildUser = require('./user');
var buildBooking = require('./booking');

function buildRequests(sessionLog) {
	var requests = _.filter(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; });
	
	// if(!requests.length) {
	// 	return;
	// }

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
	var booking = buildBooking(sessionLog);
	var user = buildUser(sessionLog);
	var lastEvent = _.last(sessionLog.events);

	return {
		sessionId: sessionLog.sessionId,
		type: 'session',
		'@timestamp': lastEvent['@timestamp'],
		errors: buildErrors(sessionLog),
		booked: booking ? true : false,
		user: user,
		bookingDetails: booking,
		requests: buildRequests(sessionLog)
	};
};
