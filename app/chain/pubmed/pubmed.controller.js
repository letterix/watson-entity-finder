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
    };

    return pubmedResource.searchPMID(query, params);
};

exports.retrieveAbstract = function(pmid) {
    var params = {
    };

    // title ex: '10.1016/j.anbehav.2015.12.020'
    return pubmedResource.retrieveAbstract(pmid, params);
};
