var _ = require('lodash');

var funnelPages = ['home', 'search', 'hotel-details', 'booking', 'booking-confirmation'];

module.exports = function(sessionLog) {
	var requests = _.filter(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; });
	var bookingErrors = _.filter(sessionLog.events).filter(function(item) { 
		return item.type === 'lr_errors' && item.url_page_type === 'booking'; 
	});
	var bookingEvent = _.chain(sessionLog.events).filter(function(item) { 
		return item.type === 'domain_events' && item.domainEventType === "booking made"; 
	}).first().value();
	var requestsWithHotelDetailsProviders = _.filter(requests, function(request) {
		return request.hotel_details_provider;
	});
	var providers = _.chain(requestsWithHotelDetailsProviders).pluck('hotel_details_provider').uniq().value().join(' ');

	if(!requests.length) {
		return;
	}

	if(bookingEvent) {
		lastFunnelRequest = { url_page_type: 'booking-confirmation' };
	}
	else if(bookingErrors.length) {
		lastFunnelRequest = { url_page_type: 'booking' };
	}
	else {
		var lastFunnelRequest = _.chain(requests).filter(function(item) {
			return _.contains(funnelPages, item.url_page_type);
		}).last().value();
	}

	return {
		total: requests.length,
		funnelExitedAt: lastFunnelRequest ? lastFunnelRequest.url_page_type : 'unknown',
		providersEncountered: providers
	};
};
