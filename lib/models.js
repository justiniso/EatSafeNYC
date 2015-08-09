var hash = require('sha1');
var util = require('util');
var _ = require('underscore');
var moment = require('moment');

var fs = require('fs');
var codeShortMessages = JSON.parse(fs.readFileSync('lib/codes.json', 'utf8'));
var gradeMessages = JSON.parse(fs.readFileSync('lib/grades.json', 'utf8'));


/*
 * Helper function to capitalize the first letter of every word
 *    "MYSTRING IS UPPER" => "Mystring Is Upper" 
 */
var capitalize = function (s) { 
    return s.split(" ").map(function(w) { 
        return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
    }).join(" ").trim();
};

/*
 * Given a collection of items, group those items by a shared key
 *
 *    >>> var prices = [{'price': '0.99', 'price': '1.99', 'price': '0.99'}]
 *    >>> groupByKey(prices, function (item) { return item['price']; })
 *    {'0.99': [{'price': '0.99'}, {'price': '0.99'}], '1.99': [{'price': '1.99']}
 * 
 * json -- a collection or items (generally an array)
 * key -- function that accepts an item and returns the key for that item
 */
var groupByKey = function (json, key) {
    var grouped = {};
    var keys = Object.keys(json);

    for (var i = 0, len = keys.length; i < len; i++) {
        var k = key(json[i]);
        grouped[k] = grouped[k] || [];
        grouped[k].push(json[i]);
    }
    return grouped;
};


var RestaurantCollection = function (data) {
    this.restaurants = [];
    this.parse(data);
};


RestaurantCollection.prototype.parse = function (json) {

    var restaurantsByCamis = groupByKey(json, function (item) { return item['camis']; })
    
    var restaurants = Object.keys(restaurantsByCamis).map(function(k){return restaurantsByCamis[k]});

    for (var i = 0, len = restaurants.length; i < len; i ++) {
        this.restaurants.push(new Restaurant(restaurants[i]));
    }
};

RestaurantCollection.prototype.count = function () {
    return this.restaurants.length;
}


var Restaurant = function(data) {
    this.inspections = [];
    this.name = null;
    this.address = null;
    this.building = null;
    this.street = null;
    this.zip = null;
    this.lastInspectionDate = null;
    this.lastInspectionDateHuman = null;
    this.lastGrade = null;
    this.lastScore = null;
    this.parse(data);
};

/*
 * Inspections should be by date descending and an inspection has many violations
 * Violations should be sorted by criticality (most critical first in the list)
 * 
 * [
 *      Inspection{ 
 *          inspectionDate: "2015-04-28T00:00:00",
 *          violations: [Violation{}, Violation{}, Violation{}]
 *      },
 *      Inspection{ 
 *          inspectionDate: "2014-03-12T00:00:00",
 *          violations: [Violation{}, Violation{}]
 *      }
 * ]
 */
Restaurant.prototype.parse = function (json) {
    var inspectionsByDate = {};

    var keys = Object.keys(json);
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];

        var violation = new Violation(json[key]);
        var inspection = inspectionsByDate[violation.inspectionDate] || null;

        if (inspection === null) {
            inspection = new Inspection(json[key]);
            inspectionsByDate[violation.inspectionDate] = inspection;
        }
        inspection.violations.push(violation);
        // TODO: validate that the inspection has matching data with violation
    }
    
    var inspectionDates = Object.keys(inspectionsByDate);
    inspectionDates.sort();
    inspectionDates.reverse();

    this.inspections = inspectionDates.map(function (inspectionDate) { return inspectionsByDate[inspectionDate]; })
    
    // Set the extra fields
    if (this.inspections.length > 0) {
        var lastInspection = this.inspections[0];
        this.name = capitalize(lastInspection.restaurant);
        this.building = lastInspection.building;
        this.street = lastInspection.street;
        this.zip = lastInspection.zip;
        this.lastInspectionDate = lastInspection.date;
        this.lastScore = lastInspection.score;
        this.lastGrade = lastInspection.grade;
        this.lastInspectionDateHuman = lastInspection.dateHuman;

        this.address = util.format('%s %s, %s', 
            this.building, 
            capitalize(this.street), 
            this.zip
        );
    }
};


/*
 * Return the most recent inspection with a grade; this can be considered the official current
 * grade of the business.
 */
Restaurant.prototype.lastGradedInspection = function () {
    
    for (var i = 0; i < this.inspections.length; i++) {
        var inspection = this.inspections[i];
        if (inspection.grade) {
            return inspection;
        }
    }
    return null
};

Restaurant.prototype.toString = function () {
    var formatted = '';
    _.each(this.inspections, function (inspection) {
        formatted += inspection.toString() + '\n';
    });
    return formatted;
};

/*
 * Inspections have unique key identitied by (camis, inspection date)
 */
var Inspection = function (record) {
    this.restaurant = record['dba'];
    this.building = record['building'];
    this.street = record['street'];
    this.zip = record['zipcode'];
    this.camis = record['camis'];
    this.gradeDate = record['grade_date'];
    this.date = record['inspection_date'];
    this.score = record['score'];
    this.grade = record['grade'];
    this.violations = [];
    this.dateHuman = moment(this.date, 'YYYY-MM-DDTh:mm:ss').fromNow();
};

Inspection.prototype.id = function () {
    return hash(util.format('%d:s'), this.camis, this.date)
};

Inspection.prototype.toString = function () {
    var sep = '\n\n';

    var violationDescriptions = this.violations.map(function (violation) { 
        return violation.descriptionHuman;
    })

    var restaurantDetails = util.format('%s\n%d %s, %d', 
        capitalize(this.restaurant), 
        this.building,
        capitalize(this.street),
        this.zip
    );

    return util.format('%s\n\nGrade: %s\n%d Violations\n\n%s', 
        restaurantDetails,
        gradeMessages[this.grade] || 'Ungraded Inspection',
        this.violations.length,
        violationDescriptions.join(sep)
    );
};

/*
 * Violations have unique key identitied by (camis, inspection date, violation code)
 */
var Violation = function (record) {
    this.camis = record['camis'];
    this.inspectionDate = record['inspection_date'];
    this.code = record['violation_code'];
    this.description = record['violation_description'];
    this.critical = record['critical_flag'];
    this.descriptionHuman = this.getShortDescription();
};

Violation.prototype.id = function () {
    return hash(util.format('%d:%s:%s', this.camis, this.inspectionDate, this.code))
};

Violation.prototype.getShortDescription = function () {
    var description = codeShortMessages[this.code] || this.description;

    return util.format('%s (%s)', description, this.critical); 
};


module.exports = {
    capitalize: capitalize,
    groupByKey: groupByKey,
    RestaurantCollection: RestaurantCollection,
    Restaurant: Restaurant,
    Inspection: Inspection,
    Violation: Violation
};