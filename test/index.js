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

			server = null;
		});

		function sendTest(testData, gapBetween) {
			var currentTestItem = JSON.stringify(testData.shift());
			var message = new Buffer(currentTestItem);

			udpClient.send(message, 0, message.length, port, "localhost", function() {
				if(testData.length) {
					setTimeout(function() {
						sendTest(testData, gapBetween);
					}, gapBetween);
				}
			});
		}

		function loadTestData(fileName) {
			var testData = fs.readFileSync(__dirname + '/data/' + fileName, 'utf-8');

			return JSON.parse(testData);
		}

		function cloneData(data) {
			return JSON.parse(JSON.stringify(data));
		}

		describe('creates new session object', function() {
			it('with specified sessionId', function(done) {
				var testData = loadTestData('one.json');

				sendTest(cloneData(testData), 100);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.sessionId).to.be(testData[0].sessionId);
					done();
				});
			});

			it('sets number of errors encountered when session contains errors', function(done) {
				var testData = loadTestData('errors.json');

				sendTest(testData, 100);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.errors).to.be(2);
					done();
				});
			});

			it('sets booked to false if session does not contain conversion event', function(done) {
				var testData = loadTestData('one.json');

				sendTest(testData, 100);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.booked).to.be(false);
					done();
				});
			});

			it('sets booked to true if session contains conversion event', function(done) {
				var testData = loadTestData('booking.json');

				sendTest(testData, 100);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.booked).to.be(true);
					done();
				});
			});

			it('sets bookingDetails if session contains conversion event', function(done) {
				var testData = loadTestData('booking.json');

				sendTest(testData, 100);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.bookingDetails).to.eql({
						rooms: 1,
						nights: 2,
						roomNights: 2,
						hotel: {
							id: 123432,
							provider: 'LateRooms',

						},
						affiliate: {
							id: 1234,
							name: 'AsiaRooms'
						},
						totalAmountGbp: 110,
						commission: {
							percent: 18,
							value: 19.8
						},
						channel: {
							id: 9
						}
					});
					done();
				});
			});

			it('sets user userAgent to value of last request', function(done) {
				var testData = loadTestData('one.json');

				sendTest(testData, 100);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.user.userAgent).to.eql({
						full: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
						name: "Googlebot",
						os: "Other",
						osName: "Other",
						device: "Spider",
						major: "2",
						minor: "1"
					});
					done();
				});
			});

			describe('sets user type', function() {
				it('to GoodBot when last request was identified as a bot from UserAgent', function(done) {
					var testData = loadTestData('one.json');

					sendTest(testData, 100);

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						expect(parsedData.user.type).to.be('GoodBot');
						done();
					});
				});

				it('to BadBot when last request was not identified as a bot from UserAgent and BotBuster score over 0', function(done) {
					var testData = loadTestData('one.json');

					testData[0]['UA_is_bot'] = false;
					testData[0]['botBuster_score'] = "1000";

					sendTest(testData, 100);

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						expect(parsedData.user.type).to.be('BadBot');
						done();
					});
				});

				it('to Human when last request was not identified as a bot from UserAgent and BotBuster score of 0', function(done) {
					var testData = loadTestData('one.json');

					testData[0]['UA_is_bot'] = false;

					sendTest(testData, 100);

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						expect(parsedData.user.type).to.be('Human');
						done();
					});
				});
			});
		});
	});
});
