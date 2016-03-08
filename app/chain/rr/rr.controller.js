/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var config = require('config');
var scidirController = require('../scidir/scidir.controller');
var errorHandler = require('../../handler/error.handler.js');
var utils = require('../../utility/utils');

// DOES EXPORT
// ====================================================

exports.search = function(search) {
    return scidirController.search(search)
        .then(retrieveFullText);
};


function retrieveFullText(jsonBody) {
    console.log("retrieveFullText");
    return Promise.filter(jsonBody['search-results'].entry, filterNoPii)
        .map(function(entry) {
            console.log("pii: " + entry['pii']);
            return scidirController.retrieveFullText(entry['pii'])
                .then(extractRREntities);
        })
        .map(convertToAdd)
        .then(fixJSON);
}

// HELPER FUNCTIONS
function filterNoPii(entry) {
    return !!entry.pii;
}

function filterNoCreator(entry) {
    var data = entry['full-text-retrieval-response'].coredata;
    return data['dc:creator'] && data['dc:creator'].length;
}

function filterNoSubject(entry) {
    var data = entry['full-text-retrieval-response'].coredata;
    return data['dcterms:subject'] && data['dcterms:subject'].length;
}

function convertToAdd(entry) {
    return '"add": ' + JSON.stringify(entry);
}

function fixJSON(entries) {
    return new Promise(function(resolve) {
        var result = '';
        result = '{' + entries.join(',') + ',"commit" : { }}';
        return resolve(result);
    }); 
}

function extractRREntities(jsonBody) {
    return new Promise(function(resolve, reject) {
        var data = jsonBody['full-text-retrieval-response'].coredata;
        var author = data['dc:creator'] && data['dc:creator'].length ? data['dc:creator'].map(function(author){return author['$'];}) : null;
        var subject = data['dcterms:subject'] && data['dcterms:subject'].length ? data['dcterms:subject'].map(function(subject){return subject['$'];}) : null;
        
        return resolve({
            doc: {
                id: data['eid'],
                author: author,
                bibliography: subject,
                body: data['dc:description'],
                title: data['dc:title']
            }
        });
    });
} 



