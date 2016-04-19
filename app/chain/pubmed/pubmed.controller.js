/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var pubmedResource = require('./pubmed.resource');
var errorHandler = require('../../handler/error.handler.js');
var config = require('config');

// DOES EXPORT
// ====================================================

exports.searchPMID = function(query) {
    var params = {
        'db': 'pubmed',
        'field': 'title',
        'retmax': '100',
        'retmode': 'json',
        'term': query
    };

    return pubmedResource.searchPMID(params);
};

exports.retrieveAbstract = function(pmid) {
    var params = {
        'db': 'pubmed',
        'retmode': 'text',
        'rettype': 'abstract',
        'id': pmid
    };

    return pubmedResource.retrieveAbstract(params);
};

exports.authorSearch = function(query) {
    var params = {
        'db': 'pubmed',
        'field': 'author',
        'retmax': '100',
        'retmode': 'json',
        'term': query
    };

    return pubmedResource.authorSearch(params);
};