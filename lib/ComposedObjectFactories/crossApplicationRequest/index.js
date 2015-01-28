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
			paths: _.pluck(apiRequests, 'url_path')
		},
		connectivityErrors: {
			count: connectivityErrors.length,
			lastError: lastConnectivityError
		}
	}

	if(varnishRequest && varnishRequest.url_page_type === 'hotel-details') {
		var isNoRates = _.chain(logEntries.events).filter(function(request) {
			return request.type === 'ms_logging' && request.message === 'rates response with no rooms';
		}).first().value();

		builtObject['noHotelDetailsRates'] = isNoRates ? true : false;
	}

	return builtObject;
};
