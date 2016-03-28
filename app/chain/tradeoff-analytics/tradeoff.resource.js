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
var utils  = require('../../utility/utils');
var watson = require('watson-developer-cloud');

var tradeoff_analytics = watson.tradeoff_analytics({
    password: '7sT7G6DRKKct',
    username: 'e2c4ca8a-10b7-4897-9dd8-505a7e1e1674',
    version: 'v1'
});

exports.getDilemmas = function(problem) {
    //console.log(problem);
    return new Promise(function(resolve, reject) {
        tradeoff_analytics.dilemmas(problem, function(err, resolution) {
            if (err) {
                console.log(err)
                return reject(err);
            }
            else {
                console.log(resolution.resolution);
                return resolve(resolution);
            }
        }); 
    });        
}
