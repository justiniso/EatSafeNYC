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
    
    var result = {
        error: null,
        results: null,
    };

    if (!queryTerm) {
        result.error = 'Invalid query';
        cb(result);
        return;
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

                result.results = restaurantCollection;
                cb(result);

            } catch (e) {
                // TODO: better error handling
                logError(e);
                result.error = e;
                cb(result);
            }
        }, 
        error: function (error) {
            logError(error);
            // TODO: log error when logging is in place
            result.error = e;
            cb(result);
        }
    });
};

module.exports = {
    'query': query
}