var expect = require('expect.js');
var buildBookingJourney = require('../../../lib/ComposedObjectFactories/session/newBookingProcessJourney');

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
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'bookingFormLoad' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'clickedBook' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'personalDetailsEntered' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'continueAsGuest' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'bookingrequestreceived' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'tokenisationrequested' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'submitbooking' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'gettokenisationsession' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'bookingcomplete' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'confirmationPageLoad' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'paymentDetailsValidationFailed' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'login' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'personalDetailsValidationFailed' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'resapipostbookingerror' },
					{ type: 'domain_events', domainEventType: 'newBookingProcessJourney', eventName: 'bookingrequestfailedvalidation' }
				]
			}).eventsTracked).to.be('continueAsGuest login personalDetailsEntered personalDetailsValidationFailed clickedBook paymentDetailsValidationFailed bookingrequestreceived bookingrequestfailedvalidation gettokenisationsession tokenisationrequested submitbooking resapipostbookingerror bookingcomplete bookingFormLoad confirmationPageLoad');
		});
	});
});
