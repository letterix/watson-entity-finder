/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var alchemyController = require('./alchemy.controller');

module.exports = function(routes) {

    // This just a hard coded test
    routes.get('/', function(request, response) {
    
	    var params = {
	        "url": "https://en.wikipedia.org/wiki/Steve_Jobs", 
	        "apikey": "9da318e13054c45454b95f3d9db450041f69a507",
	        "outputMode": "json"
	    };

        alchemyController.getEntities(params)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};