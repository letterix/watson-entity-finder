/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var rankResource = require('./rank.resource');
var errorHandler = require('../../handler/error.handler.js');
var config = require('config');

// DOES EXPORT
// ====================================================

exports.rank = function(data) {
    var params = {
    };

    return rankResource.rank(data, params);
};
