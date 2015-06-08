
var constants = require('../constants.js');
var url = require('url');
var request = require('request');
var Promise = require('es6-promise').Promise;

/*
 * A SodaClient is meant to be an API client for a single resource available
 * from https://nycopendata.socrata.com/
 * 
 * Then end url constructed should look like: 
 * https://data.cityofnewyork.us/resource/xx67-kt59.json
 */
var SodaClient = function (path) {
    this.baseUri = url.resolve(constants.NYC_DATA_URL, path);
    this.path = path;
    this.client = request;
};


/*
 * Make a GET request on the resource;
 * client.get({ params: {'$q': 'my query string'},
 *      sucess: function (body) {...},
 *      error: function (error) {...}
 * })
 */
SodaClient.prototype.get = function (options) {
    var uriComponents = url.parse(this.baseUri);
    uriComponents.query = options.params;

    var uri = url.format(uriComponents);
    var client = this.client;

    var promise = new Promise(function (resolve, reject) {
        try {
            client.get(uri, function(err, response, body) {
                if (response && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            });
        } catch (e) {
            options.error(e);
        }
    }).then(options.success, options.error);
};

module.exports = SodaClient;