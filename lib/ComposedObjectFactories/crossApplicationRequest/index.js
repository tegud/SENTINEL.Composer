var _ = require('lodash');
var moment = require('moment');

module.exports = function(logEntries) {
	var varnishRequest = _.chain(logEntries.events).filter(function(request) {
		return request.type === 'lr_varnish_request';
	}).first().value();

	var apiRequests = _.filter(logEntries.events, function(request) {
		return request.type === 'api_varnish';
	});

	var totalApiRequestTime = _.reduce(apiRequests, function(total, request) { return total + request.ttfb }, 0);
	var slowestApiRequest = _.chain(apiRequests).sortBy(function(request) { return request.ttfb; }).last().value();

	var connectivityErrors = _.filter(logEntries.events, function(request) {
		return request.type === 'hotel_acquisitions_errors';
	});

	var connectivityRequests = _.filter(logEntries.events, function(request) {
		return request.type === 'hotels_acquisitions_request';
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
	
	var apiRequestsData = {
		paths: _.pluck(apiRequests, 'url_path'),
		count: apiRequests.length,
		totalTime: totalApiRequestTime
	};

	if(slowestApiRequest) {
		apiRequestsData.slowest = {
			endpoint: slowestApiRequest.api_endpoint,
			ttfb: slowestApiRequest.ttfb
		};
	}

	var connectivityData = {
		requestCount: connectivityRequests.length,
		errorCount: connectivityErrors.length,
		lastError: lastConnectivityError
	};

	if(connectivityRequests.length) {
		var firstConnectivityRequest = _.first(connectivityRequests);

		connectivityData.method = firstConnectivityRequest.availabilityServiceMethod;
		connectivityData.hasRates = firstConnectivityRequest.hasRates;
		connectivityData.provider = firstConnectivityRequest.provider;
	}

	if(varnishRequest && varnishRequest['@timestamp']) {
		delete varnishRequest['@timestamp'];
	}

	builtObject = {
		type: 'cross_application_request',
		'@timestamp': timestamp,
		varnishRequest: varnishRequest,
		apiRequests: apiRequestsData,
		connectivity: connectivityData
	}

	if(varnishRequest && varnishRequest.url_page && varnishRequest.url_page.indexOf('/rates/') === 0) {
		builtObject['noHotelDetailsRates'] = varnishRequest.resp_headers && varnishRequest.resp_headers.x_debug_no_rates === 'true' ? true : false;
	}

	return builtObject;
};
