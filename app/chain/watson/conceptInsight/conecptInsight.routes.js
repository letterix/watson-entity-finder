'use strict';
 
// dependencies
var responseHandler   = require('../../../handler/response.handler');
var conceptController = require('./conceptInsight.controller');

// test the connectivity to the bluemix service
// try it out by running the app and visit localhost:port/api/testaccount
module.exports = function(routes){
	routes.get('/testaccount', function(req,res){
		conceptController.testAccount()
		.then(responseHandler(sendJsonResponse(res)))
		.catch(responseHandler.sendErrorResponse(res));
	});

	routes.get('/test', function(req,res){
		conceptController.testFunction()
		.then(responseHandler(sendJsonResponse(res)))
		.catch(responseHandler.sendErrorResponse(res));
	});

	return routes;
}