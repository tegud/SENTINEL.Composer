var _ = require('lodash');
var moment = require('moment');

var eventTypeOrder = {
	'onlinecontroller' : -3,
	'onlinecontrollerfinished' : -2,
	'continueclicked': -1,
	'clickedbook': 0,
	'validation': 1,
	'formsubmittedclient': 2,
	'ipgrequest': 3,
	'ipgresponse': 4,
	'ipgretry': 5,
	'waitonipg': 6,
	'clientsidecomplete': 7,
	'stillactive': 8,
	'serversideformsubmit': 100,
	'serversideerror': 200,
	'serversideexception': 201,
	'serversidesuccess': 202
};

var eventNameMappings = {
	'server side form submit': 'serversideformsubmit',
	'server side error': 'serversideerror',
	'server side exception': 'serversideexception',
	'server side success': 'serversidesuccess',
	'server side online action started': 'onlinecontroller',
	'server side online action finished': 'onlinecontrollerfinished',
	'server side IPG retry': 'ipgretry'
};

module.exports = function(sessionLog) {
	var bookingJourneyRequests = _.filter(sessionLog.events, function(item) { 
		return item.type === 'domain_events'
			&& item.domainEventType === 'booking journey event';
	});

	if(!bookingJourneyRequests.length) {
		return {};
	}

	var validationFailures = _.filter(bookingJourneyRequests, function(item) {
		return item.event === 'validation' && item.state === 'false';
	}).length;

	var ipgFailures = _.filter(bookingJourneyRequests, function(item) {
		return item.event === 'ipgresponse' && item.state === 'error';
	}).length;

	var serverSideFormSubmitEvent = _.chain(bookingJourneyRequests).filter(function(item) {
		return item.event === 'server side form submit';
	}).first().value();

	var matchedEvents = _.chain(bookingJourneyRequests).sortBy(function(item) {
		var eventName = eventNameMappings[item.event] ? eventNameMappings[item.event] : item.event;

		return typeof item.order === 'undefined' ? eventTypeOrder[eventName] : item.order; 
	}).map(function(item) {
		var eventName = eventNameMappings[item.event] ? eventNameMappings[item.event] : item.event;

		return eventName;
	}).value();

	var ipgRetries = _.filter(bookingJourneyRequests, function(item) {
		return item.event === 'server side IPG retry';
	}).length;

	var furthestPointReached = _.reduce(matchedEvents, function(currentFurthestEvent, event) {
		if(!currentFurthestEvent || eventTypeOrder[event] > eventTypeOrder[currentFurthestEvent]) {
			return event;
		}

		return currentFurthestEvent;
	}, '');

	var bookingJourney = { 
		furthestPointReached: furthestPointReached,
		eventsTracked: matchedEvents.join(' '),
		ipgFailures: ipgFailures,
		ipgRetries: ipgRetries,
		validationFailures: validationFailures,
		enquiryGuid: serverSideFormSubmitEvent ? serverSideFormSubmitEvent.eg : 'Unknown'
	};

	if(furthestPointReached === 'waitonipg') {
		var userResponse = 'exit';
		var ipgHang = {};

		var eventNames = _.chain(sessionLog.events).map(function(event) {
			return event.domainEventType === 'booking journey event' ? event.type + '.' + event.event : event.type; 
		});

		var positionOfLastIpgRequest = eventNames.lastIndexOf('domain_events.ipgrequest').value();
		var positionOfLastWait = eventNames.lastIndexOf('domain_events.waitonipg').value();

		var subsequentEvents = sessionLog.events.slice(positionOfLastWait + 1);

		if(subsequentEvents.length) {
			var requests = _.filter(subsequentEvents, function(event) {
				return event.type === 'lr_varnish_request' || 'ms_logging';
			});

			if(requests.length) {
				userResponse = 'returnToSite';
			}
		}

		if(positionOfLastIpgRequest > -1 && positionOfLastWait > -1) {
			var timeSpentWaitingBeforeExit = moment(sessionLog.events[positionOfLastWait]['@timestamp']).diff(moment(sessionLog.events[positionOfLastIpgRequest]['@timestamp']), 'ms');

			ipgHang.timeSpentWaitingBeforeExit = timeSpentWaitingBeforeExit;
		}

		ipgHang.userResponse = userResponse;

		bookingJourney.ipgHang = ipgHang;
	}
	
	return bookingJourney;
};
