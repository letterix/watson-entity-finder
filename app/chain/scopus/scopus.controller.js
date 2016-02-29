/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var scopusResource = require('./scopus.resource');
var errorHandler = require('../../handler/error.handler.js');
var config = require('config');

// DOES EXPORT
// ====================================================

exports.search = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'query': query
    };

    return scopusResource.search(params);
};

exports.authorSearch = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'query': query
    };
    return scopusResource.authorSearch(params);
};

exports.retrieveAuthor = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'query': query
    };

    return scopusResource.retrieveAuthor(params);
};

exports.retrieveAbstract = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'query': query
    };

    return scopusResource.retrieveAbstract(params);
};
