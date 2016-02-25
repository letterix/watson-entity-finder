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

var scopusSearchUrl = config.RESOURCE_SCOPUS_SEARCH_URL;
var apikey = config.RESOURCE_SCOPUS_API_KEY;

exports.get = function() {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json' + '&query=wilsons',
        method: 'GET',
        json: true,
        gzip: true
    };
    
    
    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
    
};