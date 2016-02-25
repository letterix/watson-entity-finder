/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var scopusResource = require('./scopus.resource');
var errorHandler = require('../../handler/error.handler.js');

// DOES EXPORT
// ====================================================

exports.search = function(search) {
   return scopusResource.search(search);
};

exports.authorSearch = function(search) {
   return scopusResource.authorSearch(search);
};

exports.retrieveAuthor = function(search) {
   return scopusResource.retrieveAuthor(search);
};

exports.retrieveAbstract = function(search) {
   return scopusResource.retrieveAbstract(search);
};