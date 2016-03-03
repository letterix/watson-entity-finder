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
            //return scidirController.retrieveFullText(entry['pii']);
            return new Promise(function(resolve, reject) {
                return scidirController.retrieveFullText(entry['pii']) 
            });
        }
    );
}

// HELPER FUNCTIONS
function filterNoPii(entry) {
    return !!entry.pii;
}

/*
function extractRREntities(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(entry) {
            return new Promise(function(resolve, reject) {
                return resolve({
                    id: entry['source-id'],
                    author: entry['dc:creator'],
                    bibliography: 'todo',
                    body: 'todo',
                    titel: entry['dc:title']
                });
            });
        });
} */



