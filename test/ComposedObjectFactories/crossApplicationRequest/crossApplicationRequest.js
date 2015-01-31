var expect = require('expect.js');
var buildRequest = require('../../../lib/ComposedObjectFactories/crossApplicationRequest');

describe('crossApplicationRequest', function() {
	it('sets type to "cross_application_request".', function() {
		expect(buildRequest({
			events: [
				{ }
			]
		}).type).to.be('cross_application_request');
	});

	describe('sets @timestamp', function() {
		it('to last log item with @timestamp', function() {
			expect(buildRequest({
				events: [
					{ "type": "lr_varnish_request", "@timestamp": "WRONG" },
					{ "type": "lr_varnish_request", "@timestamp": "fdsfsdgsgs" }
				]
			})['@timestamp']).to.eql('fdsfsdgsgs');
		});
	});

	describe('sets varnishRequest', function() {
		it('to lr_varnish_request', function() {
			expect(buildRequest({
				events: [
					{ "type": "lr_varnish_request", "x": 100 },
					{ "type": "something_else", "x": -1 }
				]
			}).varnishRequest.x).to.be(100);
		});

		it('strips @timestamp', function() {
			expect(buildRequest({
				events: [
					{ "type": "lr_varnish_request", "@timestamp": "fdsfsdgsgs" }
				]
			}).varnishRequest['@timestamp']).to.eql(undefined);
		});
	});

	describe('sets noHotelDetailsRates on rates request', function() {
		it('to true when header indicates no rates were displayed', function() {
			expect(buildRequest({
				events: [
					{ "type": "lr_varnish_request", "url_page": "/rates/", "resp_headers": { "X_debug_no_rates": "true" } }
				]
			}).noHotelDetailsRates).to.be(true);
		});

		it('to false when header not present', function() {
			expect(buildRequest({
				events: [
					{ "type": "lr_varnish_request", "url_page": "/rates/" }
				]
			}).noHotelDetailsRates).to.be(false);
		});
	});

	describe('apiRequests', function() {
		it('sets api paths requested', function() {
			expect(buildRequest({
				events: [
					{ "type": "api_varnish", "url_path": "/seocontent/seocontent/" },
					{ "type": "api_varnish", "url_path": "/hotel/203772/reviews/" },
					{ "type": "api_varnish", "url_path": "/hotel/203772/rates/byoccupancy/" },
					{ "type": "lr_varnish_request" }
				]
			}).apiRequests.paths).to.eql(['/seocontent/seocontent/','/hotel/203772/reviews/','/hotel/203772/rates/byoccupancy/']);
		});

		it('sets api request count', function() {
			expect(buildRequest({
				events: [
					{ "type": "api_varnish", "url_path": "/seocontent/seocontent/" },
					{ "type": "api_varnish", "url_path": "/hotel/203772/reviews/" },
					{ "type": "api_varnish", "url_path": "/hotel/203772/rates/byoccupancy/" },
					{ "type": "lr_varnish_request" }
				]
			}).apiRequests.count).to.eql(3);
		});
	});
	

	describe('sets connectivity', function() {
		describe('requestCount', function() {
			// 
			it('to 0 when no requests', function() {
				expect(buildRequest({
					events: [
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivity.requestCount).to.be(0);
			});

			it('to 1 when one request', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotels_acquisitions_request" },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivity.requestCount).to.be(1);
			});
		});

		describe('errorCount', function() {
			it('to 0 when no connectivity errors', function() {
				expect(buildRequest({
					events: [
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivity.errorCount).to.be(0);
			});

			it('to 1 when connectivity errors have occurred', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotel_acquisitions_errors" },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivity.errorCount).to.be(1);
			});
		});

		describe('lastError', function() {
			it('is set', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotel_acquisitions_errors", x: 12345 },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivity.lastError.x).to.be(12345);
			});

			it('sets @timestamp to timestamp', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotel_acquisitions_errors", "@timestamp": 12345 },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivity.lastError.timestamp).to.be(12345);
			});
		});
	});
});
