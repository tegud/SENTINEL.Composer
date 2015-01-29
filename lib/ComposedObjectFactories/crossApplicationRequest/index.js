var _ = require('lodash');
var moment = require('moment');

module.exports = function(logEntries) {
	var varnishRequest = _.chain(logEntries.events).filter(function(request) {
		return request.type === 'lr_varnish_request';
	}).first().value();

	var apiRequests = _.filter(logEntries.events, function(request) {
		return request.type === 'api_varnish';
	});

	var connectivityErrors = _.filter(logEntries.events, function(request) {
		return request.type === 'hotel_acquisitions_errors';
	});

	var isNoRates;
	var builtObject;
	var lastConnectivityError = _.last(connectivityErrors);

	if(lastConnectivityError) {
		lastConnectivityError.timestamp = lastConnectivityError['@timestamp'];
		delete lastConnectivityError['@timestamp'];
	}

	var timestamp = _.chain(logEntries.events).map(function(item) {
		return item['@timestamp'];
	}).filter(function(item) {
		return item ? true : false;
	}).last().value();

	if(varnishRequest && varnishRequest['@timestamp']) {
		delete varnishRequest['@timestamp'];
	}

	builtObject = {
		type: 'cross_application_request',
		'@timestamp': timestamp,
		varnishRequest: varnishRequest,
		apiRequests: {
			paths: _.pluck(apiRequests, 'url_path'),
			count: apiRequests.length
		},
		connectivityErrors: {
			count: connectivityErrors.length,
			lastError: lastConnectivityError
		}
	}

	if(varnishRequest && varnishRequest.url_page && varnishRequest.url_page.indexOf('/rates/') === 0) {
		builtObject['noHotelDetailsRates'] = varnishRequest.resp_headers && varnishRequest.resp_headers.X_debug_no_rates === 'true' ? true : false;
	}

	return builtObject;
};
