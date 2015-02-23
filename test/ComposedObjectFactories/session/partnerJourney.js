var expect = require('expect.js');
var buildPartnerJourney = require('../../../lib/ComposedObjectFactories/session/partnerJourney');

describe('buildPartnerJourney', function () {
    it('does not fail when there are no requests', function () {
        expect(buildPartnerJourney({
            events: []
        })).to.eql({});
    });

    describe('logging partner codes', function () {
        it('logs unique partner codes in the requests', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx"
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p2398/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }]
            });
            expect(partnerJourney.number).to.eql(3);
            expect(partnerJourney.order).to.eql('NOPARTNERCODE,1301,2398');
            expect(partnerJourney.urls).to.eql('/en/Hotels.aspx,/en/p1301/Hotels.aspx,/en/p2398/Hotels.aspx');
        });

        it('log partner codes in the order they were set', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p2398/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }]
            });
            expect(partnerJourney.number).to.eql(3);
            expect(partnerJourney.order).to.eql('1301,2398,1301');
            expect(partnerJourney.urls).to.eql('/en/p1301/Hotels.aspx,/en/p2398/Hotels.aspx,/en/p1301/Hotels.aspx');
        });

        it('logs "NOPARTNERCODE" as a partner code if the partner code header disappears', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301&partnervalue=218901"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": ""
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p2398/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }]
            });
            expect(partnerJourney.order).to.eql('NOPARTNERCODE,1301-218901,NOPARTNERCODE,2398');
            expect(partnerJourney.urls).to.eql('/en/Hotels.aspx,/en/p1301/Hotels.aspx,/en/Hotels.aspx,/en/p2398/Hotels.aspx');
            expect(partnerJourney.number).to.eql(4);
        });

        it('excludes specific URLs', function () {
            var partnerJourney = buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301&partnervalue=218901"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/Rates/13233/",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/AutoComplete/Index.mvc",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/ajax",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/beacon/bookingformjourney.mvc",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/checkPage",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "autoc.php",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "en/poi/13212",
                    "resp_headers": {}
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p2398/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=2398"
                    }
                }]
            });
            expect(partnerJourney.order).to.eql('NOPARTNERCODE,1301-218901,2398');
            expect(partnerJourney.urls).to.eql('/en/Hotels.aspx,/en/p1301/Hotels.aspx,/en/p2398/Hotels.aspx');
            expect(partnerJourney.number).to.eql(3);
        });
    });

    describe('changed', function () {
        it('logs changed as true if the partner code has changed from the previous request', function () {
            expect(buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx"
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/Hotels.aspx"
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }]
            }).changed).to.eql(true);
        });

        it('logs changed as false if the partner code has not changed from the previous request', function () {
            expect(buildPartnerJourney({
                events: [{
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "url_path": "/en/p1301/Hotels.aspx",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }, {
                    "type": "lr_varnish_request",
                    "resp_headers": {
                        "X_LOG_Partner": "partner=1301"
                    }
                }]
            }).changed).to.eql(false);
        });
    });
});
