var _ = require('lodash');

module.exports = function(sessionLog) {
	var bookingEvent = _.chain(sessionLog.events).filter(function(item) { 
		return item.type === 'domain_events' && item.domainEventType === "booking made"; 
	}).first().value();

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
};
