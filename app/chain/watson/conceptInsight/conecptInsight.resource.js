'use strict';

// dependencies
var config  = require('config');
var promise = require('bluebird');
var request = require('request-promise');
var utils   = require('../../../utility/utils');
var errorHandler    = require('../../handler/error.handler');
var responseHandler = require('../../../handler/response.handler');

var watson = require('watson-developer-cloud');
var conceptInsight = watson.concept_insights({
	username: config.RESOURCE_CONCEPTINSIGHT_USERNAME,
	password: config.RESOURCE_CONCEPTINSIGHT_PASSWORD,
	version: 'v2'
});

//functions

// return: error information or account information
exports.testAccount = function(){
	conceptInsight.accounts.getAccountsInfo({}, function(err,res){
		if(err){
			console.log(err);
			return ('error occured: ' + err);

		} else {
			var accInfo = JSON.stringify(res,null,2); 
			console.log(accInfo);
			return accInfo;
			
		}
	});
}