var express = require('express');
var favicon = require('serve-favicon');
var util = require('util');
var app = require('./frontendApp.js').app;

var constants = require('./constants.js');

// Include the other apps
app.use(favicon(__dirname + '/static/img/favicon.gif'));
app.use('/api', require('./apiApp.js').app);
app.use('/sms', require('./smsApp.js').app);

var port = process.env.PORT || constants.APP_PORT;

var server = app.listen(port, function () {
    console.log(util.format('Server successfully started; listening on port %d', port));
});