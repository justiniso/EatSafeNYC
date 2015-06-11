var fs = require('fs');
var util = require('util');

var aliases = JSON.parse(fs.readFileSync('lib/searchTerms.json', 'utf8'));


/*
 * Strip common puntuation out of the string
 */
var cleanQuery = function (string, pattern) {
    var pattern = pattern || /[\.,'"-]/;
    return string.replace(pattern, '');
};


var parseTerms = function (string, pattern) {
    // All words separated by 
    var pattern = pattern || /[\s,\.]+/;

    return string.split(pattern);
};

var translateStreets = function (string, patterns) {
    // Match 1st, 2nd, 3rd, 4th, 5th, 6th, etc.
    var patterns = patterns || [/(\d+)st/, /(\d+)nd/, /(\d+)rd/, /(\d+)th/];
    patterns.map(function (pattern) {
        var match = string.match(pattern);
        if (match !== null) {
            string = string.replace(match[0], match[1]);
        }
        
    })
    return string;
};

var translateAliases = function (string, aliasPairs) {

    aliasPairs = aliasPairs || aliases;

    aliasPairs.map(function (aliasPair) {
        var alias = aliasPair[0];
        var definition = aliasPair[1];

        var pattern = new RegExp(util.format('(\\W+|^)%s(\\W+|$)', alias), 'gmi');
        string = string.replace(pattern, util.format(' %s ', definition));
    });
    return string.trim();
};

var queryTranslate = function (query) {
    return translateStreets(
        translateAliases(
            cleanQuery(query)
        )
    );
};

module.exports = {
    queryTranslate: queryTranslate
};
