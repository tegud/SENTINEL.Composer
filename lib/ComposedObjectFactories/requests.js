var _ = require('lodash');

var funnelPages = ['home', 'search', 'hotel-details', 'booking', 'booking-confirmation'];

module.exports = function(sessionLog) {
	var lastFunnelRequest;
	var firstFunnelRequest;
	var requests = _.filter(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; });
	var bookingErrors = _.filter(sessionLog.events).filter(function(item) { 
		return item.type === 'lr_errors' && item.url_page_type === 'booking'; 
	});
	
	var requestsWithHotelDetailsProviders = _.filter(requests, function(request) {
		return request.hotel_details_provider;
	});
	var providers = _.chain(requestsWithHotelDetailsProviders).pluck('hotel_details_provider').uniq().value().join(' ');
	var inMoonstickBeta = _.filter(requests, function(request) {
		return request.url_page_type !== 'home' && ((typeof request.is_moonstick === 'boolean' && request.is_moonstick) || request.is_moonstick === "true");
	}).length ? true : false;

	if(!requests.length) {
		return;
	}

	var relaventLogEntries = _.filter(sessionLog.events, function(item) {
		return (item.url_page_type && _.contains(funnelPages, item.url_page_type)) 
		|| item.type === 'lr_errors' && item.url_page_type === "booking"
		|| item.type === 'domain_events' && (item.domainEventType === "booking made" || item.domainEventType === "booking journey event");
	});

	var firstEntry = _.first(relaventLogEntries);
	var lastEntry = _.last(relaventLogEntries);
	var firstEntryRequest = 'unknown';
	var lastEntryRequest = 'unknown';

	if(firstEntry && firstEntry.domainEventType === 'booking made') {
		firstEntryRequest = 'booking-confirmation';
	}
	else if (firstEntry && firstEntry.domainEventType === 'booking journey event') {
		firstEntryRequest = 'booking';
	}
	else if(firstEntry && firstEntry.url_page_type){
		firstEntryRequest = firstEntry.url_page_type;
	}

	if(lastEntry && lastEntry.domainEventType === 'booking made') {
		lastEntryRequest = 'booking-confirmation';
	}
	else if (lastEntry && lastEntry.domainEventType === 'booking journey event') {
		lastEntryRequest = 'booking';
	}
	else if(lastEntry && lastEntry.url_page_type){
		lastEntryRequest = lastEntry.url_page_type;
	}

	var bookingRequestIds = requests.filter(function(request){
		return request.url_page_type && request.url_page_type === 'booking' || request.url_page_type === 'booking-confirmation';
	}).map(function(request){
		return request.requestId;
	}).join(' ');

	return {
		total: requests.length,
		funnelEnteredAt: firstEntryRequest,
		funnelExitedAt: lastEntryRequest,
		providersEncountered: providers,
		inMoonstickBeta: inMoonstickBeta,
		bookingRequestIds: bookingRequestIds
	};
};
