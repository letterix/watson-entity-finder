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

exports.get = function() {
    return scopusResource.get();
};