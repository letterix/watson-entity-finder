/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var request = require('request-promise');
var Promise = require('bluebird');
var config = require('config');
var responseHandler = require('../../handler/response.handler');
var errorHandler = require('../../handler/error.handler');

var url = config.RESOURCE_URL_WATSON;

exports.getApa = function() {
   return new Promise(function (resolve) {
   		return resolve('Jag har en apa');
   });
};