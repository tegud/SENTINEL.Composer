var Promise = require('bluebird');
var dgram = require("dgram");
var memoryStore = require('./memoryStore');
var _ = require('lodash');

module.exports = function(config) {
	var udpClient;
	var refresh;
	var refreshRate = config.refreshRate || 500;
	var expiredCheckTimeout;

	if(config.memoryStore) {
		memoryStore.configure(config.memoryStore);
	}

	function buildBookingDetails(bookingEvent) {
		if (!bookingEvent) {
			return;
		}

		return {
			rooms: bookingEvent.rooms,
			nights: bookingEvent.nights,
			roomNights: bookingEvent.rooms * bookingEvent.nights,
			hotel: {
				id: bookingEvent.hotelId,
				provider: bookingEvent.hotelProvider
			},
			affiliate: {
				id: bookingEvent.affiliateId,
				name: bookingEvent.affiliateName
			},
			totalAmountGbp: bookingEvent.totalAmountGbp,
			commission: {
				percent: bookingEvent.commission,
				value: bookingEvent.commissionValue
			},
			channel: {
				id: bookingEvent.channelId
			}
		};
	}

	function getUserTypeFromLastRequest(lastRequest) {
		if(lastRequest.UA_is_bot) {
			return 'GoodBot';
		}

		if(lastRequest.botBuster_score != "0") {
			return 'BadBot';
		}

		return 'Human';
	}

	function buildUser(sessionLog) {
		var lastRequest = _.chain(sessionLog.events).filter(function(item) { return item.type === 'lr_varnish_request'; }).last().value();

		var geoIpInfo = JSON.parse(JSON.stringify(lastRequest["geoip"]));

		delete geoIpInfo['ip'];

		return {
			ip: {
				address: lastRequest["ip"],
				organisation: lastRequest["organisation"],
				geoip: geoIpInfo
			},
			userAgent: {
				full: lastRequest['req_headers']['User_Agent'],
				name: lastRequest['UA_name'],
				os: lastRequest['UA_os'],
				osName: lastRequest['UA_os_name'],
				device: lastRequest['UA_device'],
				major: lastRequest['UA_major'],
				minor: lastRequest['UA_minor']
			},
			type: getUserTypeFromLastRequest(lastRequest)
		};
	}

	function buildSessionObject(sessionLog) {
		var bookingEvent = _.chain(sessionLog.events).filter(function(item) { return item.type === 'domain_events' && item.domainEventType === "booking made"; }).first().value();
		var user = buildUser(sessionLog);
		var lastEvent = _.last(sessionLog.events);

		return {
			sessionId: sessionLog.sessionId,
			type: 'session',
			'@timestamp': lastEvent['@timestamp'],
			errors: _.filter(sessionLog.events, function(item) { return item.type === 'lr_errors'; }).length,
			booked: bookingEvent ? true : false,
			user: user,
			bookingDetails: buildBookingDetails(bookingEvent)
		};
	}

	function checkForExpiredSessions(udpClient, options) {
		var expiredSessions = memoryStore.getAndRemoveExpired();

		expiredSessions.forEach(function(session) {
			var message = new Buffer(JSON.stringify(buildSessionObject(session)));

			udpClient.send(message, 0, message.length, options.port, "localhost", function() { });
		});

		expiredCheckTimeout = setTimeout(refresh, options.refreshRate);
	}

	return {
		start: function() {
			return new Promise(function(resolve, reject) {
				udpClient = dgram.createSocket("udp4");

				refresh = checkForExpiredSessions.bind(undefined, udpClient, {
					refreshRate: refreshRate, 
					port: config.emitOnPort
				});

				udpClient.on("error", function (err) {
					console.log("server error:\n" + err.stack);
				});

				udpClient.on("message", function messageReceived(msg) {
					var data = msg.toString('utf-8');
					var parsedData = JSON.parse(data);

					if(!parsedData.sessionId) {
						return;
					}

					memoryStore.trackSession(parsedData.sessionId, parsedData);
				});

				udpClient.on("listening", resolve);

				udpClient.bind(config.listenOnPort);

				expiredCheckTimeout = setTimeout(refresh, refreshRate);
			});
		},
		stop: function() {
			return new Promise(function(resolve, reject) {
				udpClient.close();
				clearTimeout(expiredCheckTimeout);

				resolve();
			});
		}
	};
};
