var models = require('../lib/models.js');
var assert = require('assert');


describe('groupByKey', function () {
    it('should return an associative array with keys constructed by the key function', function () {
        var expected = {
            1: [{'key': 1}, {'key': 1}],
            2: [{'key': 2}]
        };
        var actual = models.groupByKey([{'key': 1}, {'key': 2}, {'key': 1}], function (item) { 
            return item['key']; 
        });

        assert.deepEqual(actual, expected);
    });
});

describe('capitalize', function () {
    it('should capitalize words in a string separated by word boundaries', function () {
        var expected = 'The Quick, Brown Fox';
        var actual = models.capitalize('tHE quick, BROWN Fox');
        assert.equal(actual, expected);
    })
});