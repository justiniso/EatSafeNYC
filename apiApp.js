var express = require('express');
var query = require('./lib/query.js').query;

var app = express();


/*
 * Debug endpoint
 */
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

module.exports = {
    'app': app
};