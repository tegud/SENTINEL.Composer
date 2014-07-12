var _ = require('lodash');

module.exports = function(sessionLog) {
	var requests = _.filter(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; });
	
	if(!requests.length) {
		return;
	}

	var lastFunnelRequest = _.chain(requests).filter(function(item) {
		if(item.url_page_type === 'home' 
			|| item.url_page_type === 'search' 
			|| item.url_page_type === 'hotel-details' 
			|| item.url_page_type === 'booking') {
			return true;
		}
	}).last().value();

	return {
		total: requests.length,
		funnelExitedAt: lastFunnelRequest ? lastFunnelRequest.url_page_type : 'unknown'
	};
};
