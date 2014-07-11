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
				memoryStore: {
					maxInactivityUnits: 'ms',
					maxInactivity: 20
				},
				refreshRate: 10,
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
			it('with type of "session"', function(done) {
				var testData = loadTestData('one.json');

				sendTest(cloneData(testData), 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.type).to.be("session");
					done();
				});
			});

			it('with timestamp of last event', function(done) {
				var testData = loadTestData('one.json');

				sendTest(cloneData(testData), 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData['@timestamp']).to.be("2014-06-18T20:36:12.928Z");
					done();
				});
			});

			it('with specified sessionId', function(done) {
				var testData = loadTestData('one.json');

				sendTest(cloneData(testData), 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.sessionId).to.be(testData[0].sessionId);
					done();
				});
			});

			it('sets number of requests', function(done) {
				var testData = loadTestData('three.json');

				sendTest(testData, 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.requests.total).to.be(3);
					done();
				});
			});

			it('sets number of errors encountered when session contains errors', function(done) {
				var testData = loadTestData('errors.json');

				sendTest(testData, 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.errors).to.be(2);
					done();
				});
			});

			it('sets booked to false if session does not contain conversion event', function(done) {
				var testData = loadTestData('one.json');

				sendTest(testData, 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.booked).to.be(false);
					done();
				});
			});

			it('sets booked to true if session contains conversion event', function(done) {
				var testData = loadTestData('booking.json');

				sendTest(testData, 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.booked).to.be(true);
					done();
				});
			});

			it('sets bookingDetails if session contains conversion event', function(done) {
				var testData = loadTestData('booking.json');

				sendTest(testData, 5);

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					expect(parsedData.bookingDetails).to.eql({
						isTestBooking: false,
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

			describe('sets user', function() {
				it('ip address info to value of last request', function(done) {
					var testData = loadTestData('one.json');

					sendTest(testData, 5);

					udpClient.on("message", function messageReceived(msg) {
						var data = msg.toString('utf-8');
						var parsedData = JSON.parse(data);

						expect(parsedData.user.ip).to.eql({
							"address": '66.249.69.105',
							"organisation": {
								"number": "AS15169",
								"asn": "Google Inc."
							},
							"geoip": {
								"country_code2": "US",
								"country_code3": "USA",
								"country_name": "United States",
								"continent_code": "NA",
								"region_name": "CA",
								"city_name": "Mountain View",
								"latitude": 37.385999999999996,
								"longitude": -122.0838,
								"dma_code": 807,
								"area_code": 650,
								"timezone": "America/Los_Angeles",
								"real_region_name": "California",
								"location": [
									-122.0838,
									37.385999999999996
								]
							}
						});
						done();
					});
				});

				it('userAgent to value of last request', function(done) {
					var testData = loadTestData('one.json');

					sendTest(testData, 5);

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

				describe('type', function() {
					it('to GoodBot when last request was identified as a bot from UserAgent', function(done) {
						var testData = loadTestData('one.json');

						sendTest(testData, 5);

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

						sendTest(testData, 5);

						udpClient.on("message", function messageReceived(msg) {
							var data = msg.toString('utf-8');
							var parsedData = JSON.parse(data);

							expect(parsedData.user.type).to.be('BadBot');
							done();
						});
					});

					it('to Human when last request was not identified as a bot from UserAgent and BotBuster score of 0', function(done) {
						var testData = loadTestData('notabot.json');

						sendTest(testData, 5);

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
});
