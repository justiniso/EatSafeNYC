var express = require('express');
var mustacheExpress = require('mustache-express');

var query = require('./lib/query.js').query;



var app = express();
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use('/static', express.static('static'));

/*
 * Debug endpoint
 */
app.get('/up', function (req, res) {
    res.send('I am up!');
});

app.get('/', function (req, res) {
    res.render('master', {
        title: 'Eat Safe NYC - Restaurant health ratings and violations',
        partials: {
            body: 'home'
        }
    });
});


module.exports = {
    'app': app
};