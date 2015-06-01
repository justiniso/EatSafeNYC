var express = require('express');
var app = express();
var SodaClient = require('./sodaclient.js');
var InspectionCollection = require('./models.js').InspectionCollection;

// TODO: move this to another module
var logError = function (error) {
    console.error(error, error.stack.split("\n"));
};

app.get('/up', function (req, res) {
    res.send('I am up!');
});

/* 
 * Query endpoint; note that because you will not get a response until
 * we hear back from Socrata, the response time can be a while. 
 */
app.get('/query', function (req, res) {
    var sodaclient = new SodaClient('resource/xx67-kt59.json');
    var queryTerm = req.query.q;
    if (!queryTerm) {
        res.send('Invalid query');
        return;
    }
    sodaclient.get({ params: {'$q': queryTerm}, 
        success: function (body) {
            var json = JSON.parse(body);
            try {
                var inspections = new InspectionCollection(json);
                var lastGraded = inspections.lastGradedInspection() || 'This restaurant has not been graded yet';

                res.send(lastGraded.toString());
            } catch (e) {
                // TODO: better error handling
                logError(e);
                res.send(e);
            }
            return;
        }, 
        error: function (error) {
            logError(error);
            // TODO: log error when logging is in place
            res.send(error.toString());
            return;
        }
    });
    return;
});

var server = app.listen(3000, function () {});