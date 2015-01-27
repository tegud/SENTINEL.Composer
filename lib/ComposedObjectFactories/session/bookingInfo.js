var _ = require('lodash');

module.exports = function(sessionLog) {
	var bookingEvents = _.filter(sessionLog.events, function(item) { 
		return item.type === 'domain_events' && item.domainEventType === "booking made"; 
	});

	return {
		numberOfBookings: bookingEvents.length
	};
};
