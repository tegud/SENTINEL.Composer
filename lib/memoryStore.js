var moment = require('moment');

var sessions = {};

module.exports = {
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
			if(sessions[sessionId] && currentDate.diff(sessions[sessionId].lastTouch, 'seconds') > 1) {
				expired.push(sessions[sessionId]);
				delete sessions[sessionId];
			}
		});

		return expired;
	}
};
