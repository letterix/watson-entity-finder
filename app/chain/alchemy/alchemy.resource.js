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

var url = config.RESOURCE_ALCHEMY_URL;
var apikey = config.RESOURCE_ALCHEMY_API_KEY;

exports.getById = function(id) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '?' + 'apiKey=' + apikey + '&outputMode=json' + '&url=' + url,
        method: 'GET',
        json: true,
        gzip: true
    };
    
    
    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
    
};