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

var pubmedBaseUrl = config.RESOURCE_PUBMED_BASE_URL;
var pubmedFetchAbstractByPMID = config.RESOURCE_PUBMED_FETCH_ABSTRACT_PMID;
var pubmedSearchForPMID = config.RESOURCE_PUBMED_SEARCH_PMID;
var pubmedFetchAbstractByPMID = config.RESOURCE_PUBMED_SUMMARY_URL;
var pubmedFetchAbstractTextByPMID = config.RESOURCE_PUBMED_FETCH_URL;
var pubmedSearchForPMID = config.RESOURCE_PUBMED_SEARCH_URL;

exports.searchPMID = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: pubmedSearchForPMID,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.searchDoi = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: pubmedSearchForPMID,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.retrieveAbstract = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: pubmedFetchAbstractByPMID,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};

exports.retrieveAbstractText = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: pubmedFetchAbstractTextByPMID,
        method: 'GET',
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGetText)
        .catch(errorHandler.throwResourceError);
};

exports.authorSearch = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: pubmedSearchForPMID,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};
