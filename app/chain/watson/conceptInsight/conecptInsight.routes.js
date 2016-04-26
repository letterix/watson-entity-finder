'use strict';
 
// dependencies
var responseHandler   = require('../../../handler/response.handler');
var conceptController = require('./conceptInsight.controller');

// functions

module.exports = function(routes){
	// test the connectivity to the bluemix service
	routes.get('/:testaccount', function(req,res){
		conceptController.testAccount()
		.then(responseHandler(sendJsonResponse(response)))
		.catch(responseHandler.sendErrorResponse(response));
	});

	return routes;
}