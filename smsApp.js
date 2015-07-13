var express = require('express');
var twilio = require('twilio');
var query = require('./lib/query.js').query;

var app = express();

/*
 * Format a response into TwiML to be understood by Twilio
 */
var wrapResponse = function(data) {
    var resp = new twilio.TwimlResponse();
    resp.message(data);
    return resp.toString();
}

/*
 * Debug endpoint
 */
app.get('/up', function (req, res) {
    res.send('I am up!');
});

/*
 * The primary endpoint for SMS hooks. Request should send a "Body" param, which we
 * will use to query for results. 
 */
app.get('/respond', function (req, res) {
    var body = req.query.Body;
    var response = '';

    // TODO: sanitize the body before querying

    query({'query': body}, function (result) {
        var restaurants = result.results;

        if (result.error) {
            res.status(500).send('Something broke back here. Maybe try another search.');
        } else if (restaurants.restaurants.length == 0) {
            response = '0 restaurants found. Try a simpler search like "Sakura" instead of "Sakura Sushi"'; 
        } else {
            var lastGraded = restaurants.restaurants[0].lastGradedInspection();

            if (lastGraded) {
                response = lastGraded.toString();
            } else {
                response = 'This restaurant has not yet been graded. Visit the website for more info.';
            }

        }
        res.send(wrapResponse(response));
    });
});

module.exports = {
    'app': app
};