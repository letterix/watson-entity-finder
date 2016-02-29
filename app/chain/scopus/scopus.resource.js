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

var scopusSearchUrl = config.RESOURCE_SCOPUS_SEARCH_URL;
var scopusSearchAuthorUrl = config.RESOURCE_SCOPUS_SEARCH_AUTHOR_URL;
var scopusRetrieveAuthorUrl = config.RESOURCE_SCOPUS_RETRIEVE_AUTHOR_URL;
var scopusRetrieveAbstractUrl = config.RESOURCE_SCOPUS_RETRIEVE_ABSTRACT_URL;
var apiKey = config.RESOURCE_SCOPUS_API_KEY;

exports.search = function(search) {
    var params = {
        "apiKey": apiKey,
        "httpAccept": "application/json",
        "query": search
    };
    
    var options = {
        resolveWithFullResponse: true,
        uri: scopusSearchUrl,
        method: 'GET',
        json: true,
        gzip: true
    };
    
    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.authorSearch = function(search) {
    var params = {
        "apiKey": apiKey,
        "httpAccept": "application/json",
        "query": search
    };

    var options = {
        resolveWithFullResponse: true,
    //    uri: scopusSearchAuthorUrl + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json' + '&query=AUTHLASTNAME(King)%20and%20AUTHFIRST(W)%20and%20AFFIL(University)%20and%20AFFIL(Queensland)%20and%20AFFIL(Bishop%27s)',
        uri: scopusSearchAuthorUrl,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError); 
};

exports.retrieveAuthor = function(search) {
    var params = {
        "apiKey": apiKey,
        "httpAccept": "application/json",
    };

    var options = {
        resolveWithFullResponse: true,
    //    uri: scopusRetrieveAuthorUrl + '56218921200' + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json',
        uri: scopusRetrieveAuthorUrl + search,
        method: 'GET',
        json: true,
        gzip: true
    };
    
    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);  
};

exports.retrieveAbstract = function(search) {
    var params = {
        "apiKey": apiKey,
        "httpAccept": "application/json",
    };

    var options = {
        resolveWithFullResponse: true,
    //    uri: scopusRetrieveAbstractUrl + '10.1016/j.anbehav.2015.12.020' + '?' + 'apiKey=' + apiKey + '&httpAccept=application/json',
        uri: scopusRetrieveAbstractUrl + search,
        method: 'GET',
        json: true,
        gzip: true
    };
    
    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);  
};