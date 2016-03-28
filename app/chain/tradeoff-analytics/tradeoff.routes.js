/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var tradeoffController = require('./tradeoff.controller');

module.exports = function(routes) {

    routes.get('', function(request, response) {

	    var options = [
	        {
	            "values": {
		            "IPP": 3.391,
		            "SJR": 1.283,
		            "SNIP": 0.669,
		            "citedBy": 4
	            },
	            "key": 1,
	            "name": "Barazeghi E.",
	            "affiliation": {
	                "@_fa": "true",
	                "affilname": "Uppsala Universitet",
	                "affiliation-city": "Uppsala",
	                "affiliation-country": "Sweden"
	            },
                "publishedIn": "Journal",
                "publishedBy": "Clinical Epigenetics",
                "type": "Article"
	        },
	        {
	            "values": {
	                "IPP": 3.488,
	                "SJR": 1.403,
	                "SNIP": 1.141,
	                "citedBy": 0
	            },
	            "key": 2,
	            "name": "Lyons E.",
	            "affiliation": {
	                "@_fa": "true",
	                "affilname": "UT Medical Branch at Galveston",
	                "affiliation-city": "Galveston",
	                "affiliation-country": "United States"
	            },
                "publishedIn": "Journal",
                "publishedBy": "BMC Cancer",
                "type": "Article"
	        },
	        {
	            "values": {
	                "IPP": 2.618,
	                "SJR": 1.169,
	                "SNIP": 1.401,
	                "citedBy": 0
	            },
	            "key": 3,
	            "name": "Agarwal A.",
	            "affiliation": {
	                "@_fa": "true",
	                "affilname": "Sanjay Gandhi Postgraduate Institute of Medical Sciences Lucknow",
	                "affiliation-city": "Lucknow",
	                "affiliation-country": "India"
	            },
	            "publishedIn": "Journal",
	            "publishedBy": "World Journal of Surgery",
	            "type": "Article"
	        },
	        {
	            "values": {
	                "IPP": 1.292,
	                "SJR": 0.554,
	                "SNIP": 0.816,
	                "citedBy": 0
	            },
	            "key": 4,
	            "name": "Gomes A.",
	            "affiliation": {
	                "@_fa": "true",
	                "affilname": "Harokopio Panepistimio",
	                "affiliation-city": "Athens",
	                "affiliation-country": "Greece"
	            },
	            "publishedIn": "Journal",
	            "publishedBy": "Annals of Human Biology",
	            "type": "Review"
	        },
	        {
	            "values": {
	                "IPP": 3.27,
	                "SJR": 1.3,
	                "SNIP": 1.034,
	                "citedBy": 0
	            },
	            "key": 5,
	            "name": "Milner A.",
	            "affiliation": {
	                "@_fa": "true",
	                "affilname": "University of Alabama at Birmingham",
	                "affiliation-city": "Birmingham",
	                "affiliation-country": "United States"
	            },
	            "publishedIn": "Journal",
	            "publishedBy": "PLoS ONE",
	            "type": "Article"
	        }
	    ];

		console.log("tradeoff");
        tradeoffController.getDilemmas(options)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
