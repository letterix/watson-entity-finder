'use strict';

// dependencies 
var promise = require('bluebird');
var conceptInsightResource = require('./conecptInsight.resource');
var errorHandler = require('../../../handler/error.handler.js');
var config  = require('config');

// test the connectivity to the bluemix concept insight service
exports.testAccount = function(){
	console.log('testaccount');
	conceptInsightResource.testAccount();
}

exports.testFunction = function(){
	console.log('test function. !testing!')
	return conceptInsightResource.testFunction;
}