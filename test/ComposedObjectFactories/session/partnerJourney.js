var expect = require('expect.js');
var buildPartnerJourney = require('../../../lib/ComposedObjectFactories/session/partnerJourney');

describe('buildPartnerJourney', function () {
    it('does not fail when there are no requests', function () {
        expect(buildPartnerJourney({
            events: []
        })).to.eql({});
    });

    it('sets partnerCodes to nothing if no partner codes in the requests', function () {
        expect(buildPartnerJourney({
            events: [{
                "type": "lr_varnish_request"
            }]
        }).partnerCodes).to.eql('');
    });

    it('sets partnerCodes to the partner codes in the requests', function () {
        expect(buildPartnerJourney({
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
        }).partnerCodes).to.eql('partner=1301, partner=2398');
    });

    it('sets partnerCodes to the order partner codes were set', function () {
        expect(buildPartnerJourney({
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
        }).partnerCodes).to.eql('partner=1301, partner=2398, partner=1301');
    });
});
