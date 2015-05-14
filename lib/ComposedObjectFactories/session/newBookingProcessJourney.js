var eventTypeOrder = {
    'loginPageLoaded': 0,
    'continueAsGuest': 10,
    'login': 20,
    'loginFailed': 30,
    'bookingFormLoaded': 40,
    'personalDetailsEntered': 50,
    'personalDetailsValidationFailed': 60,
    'clickedBook': 70,
    'paymentDetailsValidationFailed': 80,
    'bookingrequestreceived':  90,
    'bookingrequestmissinghotelid': 100,
    'bookingrequestfailedvalidation': 110,
    'gettokenisationsession': 120,
    'gettokenisationsessionfailed': 130,
    'tokenisationrequested': 140,
    'tokenisationfailure': 150,
    'submitbooking': 160,
    'unexpectederrorpostingbooking': 170,
    'priceincreasedonbookingsubmit': 180,
    'pricedecreasedonbookingsubmit': 190,
    'multipleguestsasbookers': 200,
    'resapipostbookingerror': 210,
    'bookingcomplete': 220,
    'unknownError': 230,
    'confirmationPageLoaded': 240,
    'bookingLoadError': 250
}

var eventNameMappings = {
    'login page loaded':'loginPageLoaded'
    'continue as guest':'continueAsGuest'
    'login':'login'
    'login failed':'loginFailed'
    'booking form loaded':'bookingFormLoaded'
    'personal details entered':'personalDetailsEntered'
    'personal details validation failed':'personalDetailsValidationFailed'
    'clicked book':'clickedBook'
    'payment details validation failed':'paymentDetailsValidationFailed'
    'booking request received': 'bookingrequestreceived',
    'booking request missing hotel id': 'bookingrequestmissinghotelid',
    'booking request failed validation': 'bookingrequestfailedvalidation',
    'get tokenisation session': 'gettokenisationsession',
    'get tokenisation session failed': 'gettokenisationsessionfailed',
    'tokenisation requested': 'tokenisationrequested',
    'tokenisation failure': 'tokenisationfailure',
    'submit booking': 'submitbooking',
    'unexpected error posting booking': 'unexpectederrorpostingbooking',
    'price increased on booking submit': 'priceincreasedonbookingsubmit',
    'price decreased on booking submit': 'pricedecreasedonbookingsubmit',
    'multiple guests as bookers': 'multipleguestsasbookers',
    'res api post booking error': 'resapipostbookingerror',
    'booking complete': 'bookingcomplete',
    'unknown error':'unknownError'
    'confirmation page loaded':'confirmationPageLoaded'
    'booking load error':'bookingLoadError'
};


module.exports = function(sessionLog) {
    var bookingJourneyRequests = _.filter(sessionLog.events, function(item) {
        return item.type === 'domain_events'
            && item.domainEventType === 'newBookingProcessJourney';
    });

    if(!bookingJourneyRequests.length) {
        return {};
    }

    var validationFailures = _.filter(bookingJourneyRequests, function(item) {
        return item.eventName === 'personalDetailsValidationFailed' ||
            item.eventName === 'paymentDetailsValidationFailed';
    }).length;

    var serverSideValidationErrors = _.reduce(bookingJourneyRequests, function(item){
        return  item.eventName === 'bookingrequestfailedvalidation';
    });

    var ipgFailures = _.filter(bookingJourneyRequests, function(item) {
        return item.eventName === 'tokenisationfailure';
    }).length;

    var clickedBookEvent = _.chain(bookingJourneyRequests).filter(function(item) {
        return item.eventName === 'clickedBook';
    }).first().value();

    var matchedEvents = _.chain(bookingJourneyRequests).sortBy(function(item) {
        var eventName = eventNameMappings[item.event] ? eventNameMappings[item.event] : item.event;

        return typeof item.order === 'undefined' ? eventTypeOrder[eventName] : item.order;
    }).map(function(item) {
        var eventName = eventNameMappings[item.event] ? eventNameMappings[item.event] : item.event;

        return eventName;
    }).value();

    var furthestPointReached = _.reduce(matchedEvents, function(currentFurthestEvent, event) {
        if(!currentFurthestEvent || eventTypeOrder[event] > eventTypeOrder[currentFurthestEvent]) {
            return event;
        }

        return currentFurthestEvent;
    }, '');

    var bookingJourney = {
        furthestPointReached: furthestPointReached,
        eventsTracked: matchedEvents.join(' '),
        ipgFailures: ipgFailures,
        validationFailures: validationFailures,
        enquiryGuid: clickedBookEvent ? clickedBookEvent.enquiryGuid : 'Unknown'
    };

    return bookingJourney;
};
