var InspectionCollection = require('./models.js').InspectionCollection;
var SodaClient = require('./sodaclient.js');

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
    sodaclient.get({ params: {'$q': queryTerm}, 
        success: function (body) {
            var json = JSON.parse(body);
            try {
                var inspections = new InspectionCollection(json);
                var lastGraded = inspections.lastGradedInspection() || 'This restaurant has not been graded yet';

                if (lastGraded === null) {
                    cb(util.format('No restaurants found for: "%s"', queryTerm));
                }
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