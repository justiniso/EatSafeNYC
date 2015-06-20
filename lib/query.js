var RestaurantCollection = require('./models.js').RestaurantCollection;
var SodaClient = require('./sodaclient.js');
var lexicon = require('./lexicon.js');
var util = require('util');

// TODO: move this to another module
var logError = function (error) {
    console.error(error, error.stack.split("\n"));
};

/*
 * Perform the query. You must provide a options array with options.query specified, as
 * well as a callback function that accepts the response string.
 */
var query = function (options, cb) {
    var sodaclient = new SodaClient('resource/xx67-kt59.json');
    var queryTerm = options.query;
    if (!queryTerm) {
        cb('Invalid query');
    }
    var queryCleaned = lexicon.queryTranslate(queryTerm);
    sodaclient.get({ params: {'$q': queryCleaned}, 
        success: function (body) {
            var json = JSON.parse(body);
            try {
                // TODO: group so you only get a unique restaurant
                var restaurantCollection = new RestaurantCollection(json);

                console.log(util.format('Query: {original: "%s", cleaned: "%s", restaurants: "%s"}',
                    queryTerm,
                    queryCleaned,
                    restaurantCollection.restaurants.length));

                var message = 'Encountered an error'; 
                if (restaurantCollection.restaurants.length === 0) {
                    message = 'No restaurants found, try a simpler query (e.g. "Sakura 3rd" instead of "Sakura Sushi 3rd Avenue")';
                } else {
                    // TODO: just get the first one
                    var lastGraded = restaurantCollection.restaurants[0].lastGradedInspection();    
                    message = 'This restaurant has not been graded yet';
                }

                lastGraded = lastGraded || message;

                cb(lastGraded.toString());
            } catch (e) {
                // TODO: better error handling
                logError(e);
                cb(e.toString());
            }
            return;
        }, 
        error: function (error) {
            logError(error);
            // TODO: log error when logging is in place
            cb(error.toString());
        }
    });
    return;
};

module.exports = {
    'query': query
}