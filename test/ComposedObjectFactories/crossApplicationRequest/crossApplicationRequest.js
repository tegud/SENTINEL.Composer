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

	describe('sets noHotelDetailsRates on hotel-details page type', function() {
		it('to true when ms_logging item indicates no rates were displayed', function() {
			expect(buildRequest({
				events: [
					{ "type": "ms_logging", "message": "rates response with no rooms" },
					{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
				]
			}).noHotelDetailsRates).to.be(true);
		});

		it('to false when ms_logging item indicates no rates were displayed', function() {
			expect(buildRequest({
				events: [
					{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
				]
			}).noHotelDetailsRates).to.be(false);
		});
	});

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

	describe('sets connectivity errors', function() {
		describe('count', function() {
			it('to 0 when no connectivity errors', function() {
				expect(buildRequest({
					events: [
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivityErrors.count).to.be(0);
			});

			it('to 1 when connectivity errors have occurred', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotel_acquisitions_errors" },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivityErrors.count).to.be(1);
			});
		});

		describe('lastError', function() {
			it('is set', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotel_acquisitions_errors", x: 12345 },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivityErrors.lastError.x).to.be(12345);
			});

			it('sets @timestamp to timestamp', function() {
				expect(buildRequest({
					events: [
						{ "type": "hotel_acquisitions_errors", "@timestamp": 12345 },
						{ "type": "lr_varnish_request", "url_page_type": "hotel-details" }
					]
				}).connectivityErrors.lastError.timestamp).to.be(12345);
			});
		});
	});
});
