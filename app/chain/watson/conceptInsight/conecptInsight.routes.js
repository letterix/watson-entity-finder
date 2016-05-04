'use strict';
 
// dependencies
var responseHandler   = require('../../../handler/response.handler');
var conceptController = require('./conceptInsight.controller');

// test the connectivity to the bluemix service
// try it out by running the app and visit localhost:port/api/testaccount
module.exports = function(routes){
	routes.get('/testaccount', function(req,res){
		console.log(res);
		conceptController.testAccount()
		.catch(responseHandler.sendErrorResponse(res)); 	//sends error i presume
	});

	return routes;
}