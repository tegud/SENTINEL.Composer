var expect = require('expect.js');
var buildUser = require('../../lib/ComposedObjectFactories/user');

describe('buildUser', function() {
	describe('sets user.type', function() {
		it('to GoodBot if any request User Agent identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {}, UA_is_bot: "true" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('GoodBot');
		});

		it('to BadBot if any request Bot Buster score identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {}, botBuster_score: "150" },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('BadBot');
		});

		it('to Human if no request User Agent or Bot Buster Score identifies it as a bot', function() {
			expect(buildUser({ 
				events: [
					{ type: 'lr_varnish_request', req_headers: {} },
					{ type: 'lr_varnish_request', req_headers: {} }
				]
			}).type).to.be('Human');
		});
	});
});
