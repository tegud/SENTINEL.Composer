var expect = require('expect.js');
var buildBookingJourney = require('../../lib/ComposedObjectFactories/bookingJourney');

describe('buildRequests', function() {
	it('does not fail when there are no requests', function() {
		expect(buildBookingJourney({
			events: []
		})).to.eql({ });
	});

	describe('sets eventTracked in correct order', function() {
		it.skip('with one submit', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side online action started' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side online action finished' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'continueclicked' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 0, event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 3, event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 4, event: 'waitonipg' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 1, event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 2, event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side IPG retry' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 5, event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 6, event: 'clientsidecomplete' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 7, event: 'stillactive' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 100, event: 'server side form submit' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side success' }
				]
			}).eventsTracked).to.be('onlinecontroller onlinecontrollerfinished continueclicked clickedbook validation formsubmittedclient ipgrequest waitonipg ipgresponse ipgretry clientsidecomplete stillactive serversideformsubmit serversidesuccess');
		});

		it('with two submits, first failing validation', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 0, event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 1, event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 2, event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 4, event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 3, event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 5, event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 6, event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 100, event: 'server side form submit' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 101, event: 'submitter gathering validator data started' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 102, event: 'submitter gathering validator data finished' },
					{ type: 'domain_events', domainEventType: 'booking journey event', order: 103, event: 'submitter validation finished' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side success' }
				]
			}).eventsTracked).to.be('clickedbook validation clickedbook validation ipgrequest ipgresponse formsubmittedclient serversideformsubmit submittergatheringvalidatordatastarted submittergatheringvalidatordatafinished submittervalidationfinished serversidesuccess');
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

	it('sets enquiry guid', function() {
		expect(buildBookingJourney({ 
			events: [
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit', eg: 'random-guid-goes-here' }
			]
		}).enquiryGuid).to.eql('random-guid-goes-here');
	});

	it('sets ipgRetries', function() {
		expect(buildBookingJourney({ 
			events: [
				{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side IPG retry' }
			]
		}).ipgRetries).to.eql(1);
	});

	describe('sets ipgHang', function() {
		describe('userResponse', function() {
			it('to exit when no other requests seen', function() {
				expect(buildBookingJourney({ 
					events: [
						{ type: 'lr_varnish_request' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'waitonipg' }
					]
				}).ipgHang.userResponse).to.be('exit');
			});
			
			it('to returnToSite when lr_varnish_request seen after waitonipg', function() {
				expect(buildBookingJourney({ 
					events: [
						{ type: 'lr_varnish_request' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'waitonipg' },
						{ type: 'lr_varnish_request' }
					]
				}).ipgHang.userResponse).to.be('returnToSite');
			});
		});

		describe('timeSpentWaitingBeforeExit', function() {
			it('to the time in milliseconds between timestamps of last ipgrequest and last waitonipg', function() {
				expect(buildBookingJourney({ 
					events: [
						{ type: 'lr_varnish_request' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
						{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
						{ '@timestamp': '2014-10-23T08:09:11.676Z', type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
						{ '@timestamp': '2014-10-23T08:09:12.676Z', type: 'domain_events', domainEventType: 'booking journey event', event: 'waitonipg' }
					]
				}).ipgHang.timeSpentWaitingBeforeExit).to.be(1000);
			});
		});
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

		it('to clientsidecomplete when last booking journey event is clientsidecomplete', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clientsidecomplete' }
				]
			}).furthestPointReached).to.be('clientsidecomplete');
		});

		it('to clientsidecomplete when last booking journey event is stillactive', function() {
			expect(buildBookingJourney({ 
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clientsidecomplete' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'stillactive' }
				]
			}).furthestPointReached).to.be('stillactive');
		});

		it('to serversidesuccess when last booking journey event is server side success', function() {
			expect(buildBookingJourney({
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side success' }
				]
			}).furthestPointReached).to.be('serversidesuccess');
		});

		it('to serversideerror when last booking journey event is server side error', function() {
			expect(buildBookingJourney({
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side error' }
				]
			}).furthestPointReached).to.be('serversideerror');
		});

		it('to serversideexception when last booking journey event is server side exception', function() {
			expect(buildBookingJourney({
				events: [
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'continueclicked' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'clickedbook' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'validation' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgrequest' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'ipgresponse' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'formsubmittedclient' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side form submit' },
					{ type: 'domain_events', domainEventType: 'booking journey event', event: 'server side exception' }
				]
			}).furthestPointReached).to.be('serversideexception');
		});
	});
});
