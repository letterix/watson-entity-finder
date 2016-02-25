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
var scopusSearchAuthorUrl = config.RESOURCE_SCOPUS_SEARCH_AUTHOR_URL;
var scopusRetrieveAuthorUrl = config.RESOURCE_SCOPUS_RETRIEVE_AUTHOR_URL;
var scopusRetrieveAbstractUrl = config.RESOURCE_SCOPUS_RETRIEVE_ABSTRACT_URL;
var apiKey = config.RESOURCE_SCOPUS_API_KEY;

exports.search = function(search) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusSearchUrl + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json' + '&query=' + search,
        method: 'GET',
        json: true,
        gzip: true
    };
    
    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.authorSearch = function(search) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusSearchAuthorUrl + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json' + '&query=AUTHLASTNAME(King)%20and%20AUTHFIRST(W)%20and%20AFFIL(University)%20and%20AFFIL(Queensland)%20and%20AFFIL(Bishop%27s)',
        method: 'GET',
        json: true,
        gzip: true
    };
    
    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);    
};

exports.retrieveAuthor = function(search) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveAuthorUrl + '56218921200' + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json',
        method: 'GET',
        json: true,
        gzip: true
    };
    
    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);    
};