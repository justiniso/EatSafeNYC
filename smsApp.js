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

    // TODO: sanitize the body before querying

    query({'query': body}, function (response) {
        res.send(wrapResponse(response));
    });
});

module.exports = {
    'app': app
};