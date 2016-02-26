/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var alchemyResource = require('./alchemy.resource');
var errorHandler = require('../../handler/error.handler.js');


// DOES EXPORT
// ====================================================

exports.get = function() {
    return alchemyResource.get();
};

exports.getEntities = function(baseUrl, params) {
    return alchemyResource.getEntities(baseUrl, params);
};