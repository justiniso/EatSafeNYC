var express = require('express');
var util = require('util');

var constants = require('./constants.js');

var app = express();

app.get('/up', function (req, res) {
    res.send('I am up!');
});

// Include the other apps
app.use('/api', require('./apiApp.js').app);
app.use('/sms', require('./smsApp.js').app);

var port = process.env.PORT || constants.APP_PORT;

var server = app.listen(port, function () {
    console.log(util.format('Server successfully started; listening on port %d', port));
});