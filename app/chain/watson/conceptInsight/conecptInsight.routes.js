'use strict';
 
// dependencies
var responseHandler   = require('../../../handler/response.handler');
var conceptController = require('./conceptInsight.controller');

// test the connectivity to the bluemix service
// try it out by running the app and visit localhost:port/api/testaccount
module.exports = function(routes){
	routes.get('/testaccount', function(req,res){
		conceptController.testAccount();
	});

	return routes;
}

// https://watson-api-explorer.mybluemix.net/apis/concept-insights-v2
// http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/doc/concept-insights/