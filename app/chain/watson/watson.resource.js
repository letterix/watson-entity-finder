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

exports.getById = function(id) {
    var options = {
        resolveWithFullResponse: true,
        uri: url,
        method: 'GET',
        json: true,
        gzip: true
    };
    
    /*
     * This is how it would look like once the paths are set.
     * For now, only returns a fake response
     * 
    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
    */
   
    var response = {
        httpError: "No such entity.",
        statusCode: 200,
        body: {
            id: id
        }
    };
    
    /*var response = {
        statusCode: 400,
        body: {
            
        },
        httpError: "No such entity." 
    }*/
    
    return responseHandler.parseGet(response)
        .catch(errorHandler.throwResourceError);
};