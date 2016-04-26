'use strict';

// dependencies 
var config  = require('config');
var promise = require('bluebird');
var errorHandler = require('../../../handler/error.handler');
var conceptInsightResource = require('./conceptInsight.resource');

// functions

// test the connectivity to the bluemix concept insight service
exports.testAccount = function(){
	return conceptInsightResource.testAccount();
}