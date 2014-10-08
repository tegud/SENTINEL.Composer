var expect = require('expect.js');
var buildRequests = require('../../lib/ComposedObjectFactories/requests');

describe('buildRequests', function() {
	it('does not fail when there are no requests', function() {
		expect(buildRequests({
			events: []
		})).to.be(undefined);
	});

	it('sets inMoonStickBeta to true when non-homepage request has is_moonstick as true', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'search', is_moonstick: true }
			]
		}).inMoonstickBeta).to.be(true);
	});

	it('sets inMoonStickBeta to false when only non-homepage request has is_moonstick as true', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'home', is_moonstick: true }
			]
		}).inMoonstickBeta).to.be(false);
	});

	it('sets inMoonStickBeta to true when non-homepage request has is_moonstick as "true"', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'search', is_moonstick: "true" }
			]
		}).inMoonstickBeta).to.be(true);
	});

	it('when there are no funnel requests, it sets the exitedFunnelAt to none', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'anotherpage.mvc' }
			]
		}).funnelExitedAt).to.be('unknown');
	});

	it('when last request is home, it sets the exitedFunnelAt to home', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'home' }
			]
		}).funnelExitedAt).to.be('home');
	});

	it('when last request is hotel-details, it sets the exitedFunnelAt to hotel-details', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'hotel-details' }
			]
		}).funnelExitedAt).to.be('hotel-details');
	});

	it('when last request is search, it sets the exitedFunnelAt to search', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'search' }
			]
		}).funnelExitedAt).to.be('search');
	});

	it('when booking error has occurred, it sets the exitedFunelAt to booking', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'search' },
				{ type: 'lr_errors', url_page_type: 'booking' }
			]
		}).funnelExitedAt).to.be('booking');
	});

	it('when booking has completed, it sets the exitedFunelAt to booking-confirmation', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'search' },
				{ type: 'lr_errors', url_page_type: 'booking' },
				{ type: 'domain_events', domainEventType: 'booking made' }
			]
		}).funnelExitedAt).to.be('booking-confirmation');
	});

	it('when hotel details page has been visited with provider specified, it adds it to the list of providers session has encountered', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'hotel-details', hotel_details_provider: 'LateRooms' },
				{ type: 'lr_errors', url_page_type: 'booking' },
				{ type: 'domain_events', domainEventType: 'booking made' }
			]
		}).providersEncountered).to.be('LateRooms');
	});

	it('when multiple hotel details pages have been visited with different provider specifieds, it adds them to the list of providers session has encountered', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'hotel-details', hotel_details_provider: 'LateRooms' },
				{ type: 'lr_varnish_request', url_page_type: 'hotel-details', hotel_details_provider: 'HiltonOta' },
				{ type: 'lr_errors', url_page_type: 'booking' },
				{ type: 'domain_events', domainEventType: 'booking made' }
			]
		}).providersEncountered).to.be('LateRooms HiltonOta');
	});

	it('when multiple hotel details pages have been visited with the same provider specified, it does not add duplicates to the list of providers session has encountered', function() {
		expect(buildRequests({ 
			events: [
				{ type: 'lr_varnish_request', url_page_type: 'hotel-details', hotel_details_provider: 'HiltonOta' },
				{ type: 'lr_varnish_request', url_page_type: 'hotel-details', hotel_details_provider: 'HiltonOta' },
				{ type: 'lr_errors', url_page_type: 'booking' },
				{ type: 'domain_events', domainEventType: 'booking made' }
			]
		}).providersEncountered).to.be('HiltonOta');
	});
});
