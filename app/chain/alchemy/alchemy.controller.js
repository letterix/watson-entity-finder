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

exports.getEntities = function(params) {
    return alchemyResource.getEntities(params);
};