var expect = require('expect.js');
var buildBookingJourney = require('../../lib/ComposedObjectFactories/bookingJourney');

describe('buildRequests', function() {
	it('does not fail when there are no requests', function() {
		expect(buildBookingJourney({
			events: []
		})).to.eql({ });
	});

	it('sets eventsTracked', function() {
		expect(buildBookingJourney({ 
			events: [
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'formsubmittedclient' }
			]
		}).eventsTracked).to.be('clickedbook validation ipgrequest ipgresponse formsubmittedclient');
	});

	it('sets validation fails', function() {
		expect(buildBookingJourney({ 
			events: [
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation', state: 'false' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation', state: 'false' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation', state: 'false' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation', state: 'true' }
			]
		}).validationFailures).to.eql(3);
	});

	it('sets ipg fails', function() {
		expect(buildBookingJourney({ 
			events: [
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse', state: 'error' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse', state: 'error' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse', state: 'error' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse', state: 'error' },
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse', state: 'success' }
			]
		}).ipgFailures).to.eql(4);
	});

	describe('furthestPointReached set', function() {
		it('to clickedbook when last booking journey event is clickedbook', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' }
				]
			}).furthestPointReached).to.be('clickedbook');
		});

		it('to validation when last booking journey event is validation', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' }
				]
			}).furthestPointReached).to.be('validation');
		});

		it('to ipgrequest when last booking journey event is ipgrequest', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' }
				]
			}).furthestPointReached).to.be('ipgrequest');
		});

		it('to ipgresponse when last booking journey event is ipgresponse', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' }
				]
			}).furthestPointReached).to.be('ipgresponse');
		});

		it('to formsubmittedclient when last booking journey event is formsubmittedclient', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'formsubmittedclient' }
				]
			}).furthestPointReached).to.be('formsubmittedclient');
		});
	});
});
