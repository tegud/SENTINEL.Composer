var expect = require('expect.js');
var buildBooking = require('../../lib/ComposedObjectFactories/bookingInfo');

describe('buildBooking', function() {
	it('sets numberOfBookings to the number of booking made domain events', function() {
		expect(buildBooking({
			events: [
				{ "type": "domain_events", "domainEventType": "booking made" },
				{ "type": "domain_events", "domainEventType": "booking made" }
			]
		}).numberOfBookings).to.be(2);
	});	
});