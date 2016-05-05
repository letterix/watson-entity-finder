'use strict';

// dependencies
var config  = require('config');
var promise = require('bluebird');
var request = require('request-promise');
var utils   = require('../../../utility/utils');
var errorHandler    = require('../../../handler/error.handler.js');
var responseHandler = require('../../../handler/response.handler');

var watson = require('watson-developer-cloud');
var conceptInsight = watson.concept_insights({
	url: config.RESOURCE_CONCEPTINSIGHT_URL,
	username: config.RESOURCE_CONCEPTINSIGHT_USERNAME,
	password: config.RESOURCE_CONCEPTINSIGHT_PASSWORD,
	version: 'v2'
});

exports.testAccount = function(){
	console.log('testing connection and account cred with bluemix...');
	conceptInsight.accounts.getAccountsInfo({}, function(err,res){
		if(err){
			console.log(err);

		} else {
			console.log('success!');
			var accInfo = JSON.stringify(res,null,2); 
			console.log(accInfo);
			
		}
	});
}

exports.test = function(params){
	console.log('test!');
}