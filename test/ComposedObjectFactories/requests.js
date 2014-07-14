var expect = require('expect.js');
var buildRequests = require('../../lib/ComposedObjectFactories/requests');

describe('buildRequests', function() {
	it('does not fail when there are no requests', function() {
		expect(buildRequests({
			events: []
		})).to.be(undefined);
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
});
