var expect = require('expect.js');
var proxyquire = require('proxyquire');
var dgram = require('dgram');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var fs = require('fs');
var Server = require('../lib/server')

describe('SENTINEL.Composer', function() {
	describe('event is inputted via udp', function() {
		var udpClient;
		var server;
		var port = 1234;

		beforeEach(function(done) {
			server = new Server({
				listenOnPort: 1234,
				emitOnPort: 1235
			});

			server.start().then(done);

			udpClient = dgram.createSocket("udp4");

			udpClient.bind(1235);

			eventEmitter = new EventEmitter();
		});

		afterEach(function(done) {
			udpClient.close();
			eventEmitter.removeAllListeners();

			server.stop().then(done);
		});

		describe('creates new session object', function() {
			it('with specified sessionId', function(done) {
				var testData = fs.readFileSync(__dirname + '/data/one.json', 'utf-8');
				var parsedTestData = JSON.parse(testData);

				var message = new Buffer(JSON.stringify(parsedTestData[0]));

				udpClient.send(message, 0, message.length, port, "localhost", function() {});

				udpClient.on("message", function messageReceived(msg, rinfo) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.sessionId).to.eql(parsedTestData[0].sessionId);
					done();
				});
			});
		});
	});
});
