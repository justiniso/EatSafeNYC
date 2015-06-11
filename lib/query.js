var InspectionCollection = require('./models.js').InspectionCollection;
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
                var inspections = new InspectionCollection(json);

                console.log(util.format('Query: {original: "%s", cleaned: "%s", results: "%s"}',
                    queryTerm,
                    queryCleaned,
                    inspections.inspections.length));

                var message = 'No restaurants found. Try a simpler query.'; 
                var lastGraded = inspections.lastGradedInspection();

                if (lastGraded === null) {
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