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
var utils = require('../../utility/utils');

var scopusSearchUrl = config.RESOURCE_SCOPUS_SEARCH_URL;
var scopusSearchAuthorUrl = config.RESOURCE_SCOPUS_SEARCH_AUTHOR_URL;
var scopusRetrieveAuthorUrl = config.RESOURCE_SCOPUS_RETRIEVE_AUTHOR_BATCH_URL + '/author_id/';
var scopusRetrieveAuthorBatchUrl = config.RESOURCE_SCOPUS_RETRIEVE_AUTHOR_BATCH_URL;
var scopusRetrieveAbstractUrl = config.RESOURCE_SCOPUS_RETRIEVE_ABSTRACT_URL;
var scopusRetrieveArticleUrl = config.RESOURCE_SCOPUS_RETRIEVE_ARTICLE_URL;
var scopusRetrieveIssnUrl = config.RESOURCE_SCOPUS_RETRIEVE_ISSN_BATCH_URL + '/issn/';
var scopusRetrieveIssnBatchUrl = config.RESOURCE_SCOPUS_RETRIEVE_ISSN_BATCH_URL;
var apiKey = config.RESOURCE_SCOPUS_API_KEY;

var pool = { maxSockets: 200 };

exports.search = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusSearchUrl,
        method: 'GET',
        json: true,
        gzip: true
    };
    console.time('scopusSearch');
            
    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(function(res) {
            console.timeEnd('scopusSearch');
            return res;
        })
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.authorSearch = function(params) {
    var options = {
        resolveWithFullResponse: true,
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

exports.retrieveAuthor = function(id, params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveAuthorUrl + id,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.retrieveAuthorBatch = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveAuthorBatchUrl,
        method: 'GET',
        agent: false,
        json: true,
        gzip: true
    };
    console.time('retrieveAuthorBatch');

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(function(res) {
            console.timeEnd('retrieveAuthorBatch');
            return res;
        })
        .then(responseHandler.parseGet);
};

exports.retrieveAbstract = function(title, params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveAbstractUrl + title,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.retrieveArticle = function(eid, params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveArticleUrl + eid,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.retrieveIssn = function(issn, params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveIssnUrl + issn,
        method: 'GET',
        agent: false,
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet);
};

exports.retrieveIssnBatch = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scopusRetrieveIssnBatchUrl,
        method: 'GET',
        agent: false,
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet);
};

exports.retrieveLink = function(link, params) {
    var options = {
        resolveWithFullResponse: true,
        uri: link,
        method: 'GET',
        pool: pool,
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};
