var _ = require('lodash');

var eventTypeOrder = {
	'clickedbook': 0 ,
	'validation': 1,
	'ipgrequest': 2,
	'ipgresponse': 3,
	'formsubmittedclient': 4,
	'serversideformsubmit': 1000
};

var eventNameMappings = {
	'server side form submit': 'serversideformsubmit'
};

module.exports = function(sessionLog) {
	var bookingJourneyRequests = _.filter(sessionLog.events).filter(function(item) { 
		return item.type === 'domain_events'
			&& item.domainEventType === 'booking journey event';
	});
	var validationFailures = _.filter(bookingJourneyRequests).filter(function(item) {
		return item.event === 'validation' && item.state === 'false';
	}).length;

	var ipgFailures = _.filter(bookingJourneyRequests).filter(function(item) {
		return item.event === 'ipgresponse' && item.state === 'error';
	}).length;

	if(!bookingJourneyRequests.length) {
		return {};
	}

	var matchedEvents = _.chain(bookingJourneyRequests).sortBy(function(item) {
		var eventName = eventNameMappings[item.event] ? eventNameMappings[item.event] : item.event;

		return typeof item.order === 'undefined' ? item.order : eventTypeOrder[eventName] 
	}).map(function(item) {
		var eventName = eventNameMappings[item.event] ? eventNameMappings[item.event] : item.event;
		
		return eventName;
	}).value();

	var furthestPointReached = _.reduce(matchedEvents, function(currentFurthestEvent, event) {
		if(!currentFurthestEvent || eventTypeOrder[event] > eventTypeOrder[currentFurthestEvent]) {
			return event;
		}

		return currentFurthestEvent;
	}, '');
	
	return { 
		furthestPointReached: furthestPointReached,
		eventsTracked: matchedEvents.join(' '),
		ipgFailures: ipgFailures,
		validationFailures: validationFailures
	};
};
