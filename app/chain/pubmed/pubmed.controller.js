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
exports.getPubmedIDs = function(query) {
    var params = {
        'db': 'pubmed',
        'field': 'title',
        'retmax': '100',
        'retmode': 'json',
        'httpAccept': 'application/json',
        'term': query
    };

    return pubmedResource.searchPMID(params)
    .then(function (param){
      console.log("PubmedIDs for an article: " + param['esearchresult']['idlist']);
      return param['esearchresult']['idlist'];
    });
};

function extractNumberOfResults(pubmedSearchResult){

}

/* Function for searching for a specific doi
The doi need to be parsed before search, replacing '/' with %2F
 */
exports.searchDoi = function(query) {
    var params = {
        'db': 'pubmed',
        'retmax': '100',
        'retmode': 'json',
        'httpAccept': 'application/json',
        'term': query
    };

    return pubmedResource.searchDoi(params);
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

// Calls with post work
// ====================================================
exports.retrieveAuthors = function (pmid){
    return pubmedController.retrieveAbstract(pmid)
        .then(extractAuthors);
};

exports.retrieveIssn = function (pmid){
    return pubmedController.retrieveAbstract(pmid)
        .then(extractIssn);
}

exports.retrieveDoi = function (pmid){
    return pubmedController.retrieveAbstract(pmid)
        .then(extractDoi);
}

// HELPER FUNCTIONS
// ====================================================
function extractAuthors(jsonBody){
    var arr = [];

    jsonBody.result.uids.forEach(function (key){
        jsonBody.result[key]['authors'].map(function(info){
            arr.push(info.name);
        });
    });

    return arr;
};

function extractIssn(jsonBody){
    var arr = [];

    jsonBody.result.uids.forEach(function (key){
        if(jsonBody.result[key].issn === ""){
            console.log("ISSN not found in Abstract");
            return;
        }
        arr.push(jsonBody.result[key].issn);
        });
    return arr;
}

function extractDoi(jsonBody){
    var arr = [];

    jsonBody.result.uids.forEach(function (key){
        jsonBody.result[key]['articleids'].map(function(info){
            if(info.idtype === "doi" && info.value === ""){
                console.log("Doi not found in PMID: "+[key]);
            }
            if(info.idtype === "doi"){
                arr.push(info.value);
            }
            else{
                return;
            }
        });
    });

    return arr;
};
