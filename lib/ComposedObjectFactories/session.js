var _ = require('lodash');

var buildUser = require('./user');
var buildBooking = require('./booking');
var buildRequests = require('./requests');
var buildErrors = require('./errors');

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
