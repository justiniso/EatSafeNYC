var express = require('express');
var util = require('util');

var constants = require('./constants.js');
var SodaClient = require('./sodaclient.js');
var InspectionCollection = require('./models.js').InspectionCollection;

var app = express();

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

app.get('/up', function (req, res) {
    res.send('I am up!');
});

/* 
 * Query endpoint; note that because you will not get a response until
 * we hear back from Socrata, the response time can be a while. 
 */
app.get('/query', function (req, res) {
    query({'query': req.query.q}, function (response) {
        res.send(response);
    });
});

// TODO: app should have several receivers instead of hosting each endpoint here (sms, slack, etc.)
app.get('/twilio', function (req, res) {

    // TODO: For now, take the raw body; we can sanitize and parse later
    var body = req.query.Body;

    query({'query': body}, function (response) {
        res.send(response);
    });
});


var port = process.env.PORT || constants.APP_PORT;

var server = app.listen(port, function () {
    console.log(util.format('Server successfully started; listening on port %d', port));
});