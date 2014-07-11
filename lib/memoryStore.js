var moment = require('moment');

var sessions = {};

var maxInactivityUnits = 'seconds';
var maxInactivity = 1;

module.exports = {
	configure: function(options) {
		if(options.maxInactivityUnits) {
			maxInactivityUnits = options.maxInactivityUnits;
		}
		if(options.maxInactivity) {
			maxInactivity = options.maxInactivity;
		}
	},
	trackSession: function(sessionId, event) {
		if(!sessions[sessionId]) {
			sessions[sessionId] = {
				sessionId: sessionId,
				events: []
			};
		}

		sessions[sessionId].events.push(event);
		sessions[sessionId].lastTouch = moment();
	},
	getAndRemoveExpired: function() {
		var currentDate = moment();
		var expired = [];

		Object.keys(sessions).forEach(function(sessionId) {
			if(sessions[sessionId] && currentDate.diff(sessions[sessionId].lastTouch, maxInactivityUnits) > maxInactivity) {
				expired.push(sessions[sessionId]);
				delete sessions[sessionId];
			}
		});

		return expired;
	}
};
