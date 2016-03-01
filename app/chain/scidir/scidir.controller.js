/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var scidirResource = require('./scidir.resource');
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
    return scidirResource.search(params);
}