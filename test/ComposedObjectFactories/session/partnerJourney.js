var expect = require('expect.js');
var buildPartnerJourney = require('../../../lib/ComposedObjectFactories/session/partnerJourney');

describe('buildPartnerJourney', function () {
    it('does not fail when there are no requests', function () {
        expect(buildPartnerJourney({
            events: []
        })).to.eql({});
    });

    it('logs unique partner codes in the requests', function () {
        var request = buildPartnerJourney({
            events: [{
                "type": "lr_varnish_request"
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=1301"
                }
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=1301"
                }
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=2398"
                }
            }]
        });
        expect(request.partnerCodeOrder).to.eql('NOPARTNERCODE, partner=1301, partner=2398');
        expect(request.partnerCodeNumber).to.eql(3);
    });

    it('log partner codes in the order they were set', function () {
        var request = buildPartnerJourney({
            events: [{
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=1301"
                }
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=2398"
                }
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=1301"
                }
            }]
        });
        expect(request.partnerCodeOrder).to.eql('partner=1301, partner=2398, partner=1301');
        expect(request.partnerCodeNumber).to.eql(3);
    });

    it('logs "NOPARTNERCODE" as a partner code if the partner code header disappears', function () {
        var request = buildPartnerJourney({
            events: [{
                "type": "lr_varnish_request"
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=1301"
                }
            }, {
                "type": "lr_varnish_request"
            }, {
                "type": "lr_varnish_request",
                "resp_headers": {
                    "x_log_partner": "partner=2398"
                }
            }]
        });
        expect(request.partnerCodeOrder).to.eql('NOPARTNERCODE, partner=1301, NOPARTNERCODE, partner=2398');
        expect(request.partnerCodeNumber).to.eql(4);
    });
});
