var expect = require('expect.js');
var buildBookingJourney = require('../../lib/ComposedObjectFactories/bookingJourney');

describe('buildRequests', function() {
	it('does not fail when there are no requests', function() {
		expect(buildBookingJourney({
			events: []
		})).to.eql({ });
	});

	describe('sets eventTracked in correct order', function() {
		it('with one submit', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 0,  event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 2, event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 1, event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 3, event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 4, event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit' }
				]
			}).eventsTracked).to.be('clickedbook validation ipgrequest ipgresponse formsubmittedclient serversideformsubmit');
		});

		it.skip('with two submits, first failing validation', function() {
			expect(buildBookingJourney({ 
				events: [
					{ "@timestamp": "2014-07-18T14:16:54.864+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 0,  event: 'clickedbook' },
					{ "@timestamp": "2014-07-18T14:16:55.347+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 1, event: 'validation' },
					{ "@timestamp": "2014-07-18T14:16:56.833+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 0,  event: 'clickedbook' },
					{ "@timestamp": "2014-07-18T14:16:56.989+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 2, event: 'ipgrequest' },
					{ "@timestamp": "2014-07-18T14:16:57.317+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 1, event: 'validation' },
					{ "@timestamp": "2014-07-18T14:16:57.317+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 3, event: 'ipgresponse' },
					{ "@timestamp": "2014-07-18T14:16:57.707+01:00", type: 'domain_events', domainEventType: 'booking journey event', order: 4, event: 'formsubmittedclient' },
					{ "@timestamp": "2014-07-18T14:16:58.347+01:00", type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit' }
				]
			}).eventsTracked).to.be('clickedbook validation clickedbook validation ipgrequest ipgresponse formsubmittedclient serversideformsubmit');
		});
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

		it('to serversideformsubmit when last booking journey event is server side form submit', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit' }
				]
			}).furthestPointReached).to.be('serversideformsubmit');
		});
	});
});
