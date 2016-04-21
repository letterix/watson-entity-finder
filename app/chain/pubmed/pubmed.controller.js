/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var pubmedResource = require('./pubmed.resource');
var pubmedController = require('./pubmed.controller');
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
        'httpAccept': 'application/json',
        'term': query
    };

    return pubmedResource.searchPMID(params);
};

exports.retrieveAbstract = function(pmid) {
    var params = {
        'db': 'pubmed',
        'retmode': 'json',
        'rettype': 'abstract',
        'httpAccept': 'application/json',
        'id': pmid
    };

    return pubmedResource.retrieveAbstract(params);
};

exports.retrieveAbstractText = function(pmid) {
    var params = {
        'db': 'pubmed',
        'retmode': 'text',
        'rettype': 'abstract',
        'id': pmid
    };

    return pubmedResource.retrieveAbstractText(params);
};

exports.authorSearch = function(query) {
    var params = {
        'db': 'pubmed',
        'field': 'author',
        'retmax': '100',
        'retmode': 'json',
        'httpAccept': 'application/json',
        'term': query
    };

    return pubmedResource.authorSearch(params);
};

exports.retrieveAuthors = function(pmid) {
    var params = {
        'db': 'pubmed',
        'retmode': 'json',
        'rettype': 'abstract',
        'httpAccept': 'application/json',
        'id': pmid
    };

    return pubmedResource.retrieveAbstract(params)
        .then(extractAuthors);
};
// Calls with post work
// ====================================================
/*exports.retrieveAuthors = function (pmid){
    return pubmedController.retrieveAbstract(pmid)
        .then(extractAuthors);
};*/

// HELPER FUNCTIONS
// ====================================================
function extractAuthors(jsonBody) {
    var arr = [];

    jsonBody.result.uids.forEach(function (key){
        jsonBody.result[key]['authors'].map(function(info){
            arr.push(info.name);
        });
    });

    return arr;
};
