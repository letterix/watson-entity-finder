/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var googleResource = require('./google.resource');
var errorHandler = require('../../handler/error.handler.js');


// DOES EXPORT
// ====================================================

exports.getApa = function() {
    return googleResource.getApa();
};

