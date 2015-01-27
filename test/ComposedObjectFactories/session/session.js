var expect = require('expect.js');
var buildRequests = require('../../../lib/ComposedObjectFactories/session');

describe('buildSession', function() {
	it('sets type to "session".', function() {
		expect(buildRequests({
			events: [
				{ }
			]
		}).type).to.be('session');
	});

	it('sets started to timestamp of first event', function() {
		expect(buildRequests({
			events: [
				{ '@timestamp': "2014-06-18T20:30:12.928Z" },
				{ '@timestamp': "2014-06-18T20:36:12.928Z" }
			]
		})['started']).to.be("2014-06-18T20:30:12.928Z");		
	});

	it('sets @timestamp to last event', function() {
		expect(buildRequests({
			events: [
				{ '@timestamp': "2014-06-18T20:30:12.928Z" },
				{ '@timestamp': "2014-06-18T20:36:12.928Z" }
			]
		})['@timestamp']).to.be("2014-06-18T20:36:12.928Z");
	});

	it('sets length to time in milliseconds between first and last event', function() {
		expect(buildRequests({
			events: [
				{ '@timestamp': "2014-06-18T20:36:12.928Z" },
				{ '@timestamp': "2014-06-18T20:47:14.111Z" }
			]
		}).length).to.be(661183);
	});

	it('sets sessionId', function() {
		expect(buildRequests({
			sessionId: "543534gdfgdfgd",
			events: [
				{  }
			]
		}).sessionId).to.be("543534gdfgdfgd");
	});
});
