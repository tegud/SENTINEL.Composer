var expect = require('expect.js');
var buildErrors = require('../../../lib/ComposedObjectFactories/session/errors');

describe('buildErrors', function() {
	it('sets lastError to the last error encountered', function() {
		expect(buildErrors({
			events: [
				{
					type: 'lr_errors',
					Exception: {
						Message: 'Test Error',
						ExceptionMethod: 'SomeMethod()'
					},
					wasLastRequest: false,
					requestId: 'fdsfdsfsdfdsf'
				}
			]
		}).lastError).to.eql({
			message: 'Test Error',
			exceptionMethod: 'SomeMethod()',
			wasLastRequest: false,
			requestId: 'fdsfdsfsdfdsf'
		});
	});

	it('sets lastError wasLastRequest when last requestId matches last Error requestId', function() {
		expect(buildErrors({
			events: [
				{
					type: 'lr_errors',
					Exception: {
						Message: 'Test Error',
						ExceptionMethod: 'SomeMethod()'
					},
					wasLastRequest: false,
					requestId: 'fdsfdsfsdfdsf'
				},
				{
					type: 'lr_varnish_request',
					requestId: 'fdsfdsfsdfdsf'
				}
			]
		}).lastError.wasLastRequest).to.be(true);
	});

	it('sets total to 0 when no errors', function() {
		expect(buildErrors({
			events: [ ]
		}).total).to.be(0);
	});
});
