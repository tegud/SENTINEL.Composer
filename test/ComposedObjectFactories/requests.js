var expect = require('expect.js');
var buildRequests = require('../../lib/ComposedObjectFactories/requests');

describe('buildRequests', function() {
	it('does not fail when there are no requests', function() {
		expect(buildRequests([])).to.be(undefined);
	});

});
