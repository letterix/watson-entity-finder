/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var tradeoffResource = require('./tradeoff.resource');
var errorHandler = require('../../handler/error.handler.js');

// DOES EXPORT
// ====================================================

exports.getDilemmas = function() {
    /*
    columns = {

    };
    options = {

    };
    subject = {

    };
*/
    var problem = {
        columns: [
            {
                "type": "numeric",
                "key": "price",
                "full_name": "Price",
                "range": {
                    "low": 0.0,
                    "high": 400.0
                },
                "format": "$####0.00",
                "goal": "min",
                "is_objective": true
            },
            {
                "type": "numeric",
                "key": "weight",
                "full_name": "Weight",
                "format": "####0 g",
                "goal": "min",
                "is_objective": true
            },
            {
                "type": "categorical",
                "key": "brand",
                "full_name": "Brand",
                "range": [
                    "Apple",
                    "HTC",
                    "Samsung"
                ],
                "goal": "min",
                "preference": [
                    "Samsung",
                    "Apple",
                    "HTC"
                ],
                "is_objective": true
            },
            {
                "type": "datetime",
                "key": "rDate",
                "full_name": "Release Date",
                "goal": "max",
                "is_objective": false
            }
        ],
        "subject": "phones",
        "options": [
            {
                "key": "1",
                "name": "Samsung Galaxy S4",
                "values": {
                    "weight": 130,
                    "brand": "Samsung",
                    "price": 249,
                    "rDate": "2013-04-29T00:00:00Z"
                },
                "description_html": ""
            },
            {
                "key": "2",
                "name": "Apple iPhone 5",
                "values": {
                    "weight": 112,
                    "brand": "Apple",
                    "price": 449,
                    "rDate": "2012-09-21T00:00:00Z"
                },
                "description_html": ""
            },
            {
                "key": "3",
                "name": "HTC One",
                "values": {
                    "weight": 143,
                    "brand": "HTC",
                    "price": 299,
                    "rDate": "2013-03-01T00:00:00Z"
                },
                "description_html": ""
            }
        ]
    };

    return tradeoffResource.getDilemmas(problem);
};
