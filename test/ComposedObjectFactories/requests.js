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
});
