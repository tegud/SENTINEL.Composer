var _ = require('lodash');
var moment = require('moment');

var buildUser = require('./user');
var buildBooking = require('./booking');
var buildBookingJourney = require('./bookingJourney');
var buildRequests = require('./requests');
var buildErrors = require('./errors');

module.exports = function(sessionLog) {
	var booking = buildBooking(sessionLog);
	var user = buildUser(sessionLog);
	var firstEvent = _.first(sessionLog.events);
	var lastEvent = _.last(sessionLog.events);

	return {
		sessionId: sessionLog.sessionId,
		type: 'session',
		started: firstEvent['@timestamp'],
		'@timestamp': lastEvent['@timestamp'],
		length: moment(lastEvent['@timestamp']).diff(moment(firstEvent['@timestamp']), 'ms'),
		errors: buildErrors(sessionLog),
		booked: booking ? true : false,
		user: user,
		bookingDetails: booking,
		bookingJourney: buildBookingJourney(sessionLog),
		requests: buildRequests(sessionLog)
	};
};
