/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var tradeoffResource = require('./tradeoff.resource');
var errorHandler = require('../../handler/error.handler.js');

// DOES EXPORT
// ====================================================

exports.getDilemmas = function(options) {
    var columns = [
        {
            "type": "numeric",
            "key": "citedBy",
            "full_name": "Cited by - count",
            "range": {
              "low": 0,
              "high": 400
            },
            "format": "####0",
            "goal": "max",
            "is_objective": true
        },
        {
            "type": "numeric",
            "key": "IPP",
            "full_name": " Impact per Publication",
            "range": {
              "low": 0.000,
              "high": 10.000
            },
            "format": "0.000",
            "goal": "max",
            "is_objective": true
        },
        {
            "type": "numeric",
            "key": "SJR",
            "full_name": "SCImago Journal Rank",
            "range": {
              "low": 0.000,
              "high": 10.000
            },
            "format": "0.000",
            "goal": "max",
            "is_objective": true
        },        
        {
            "type": "numeric",
            "key": "SNIP",
            "full_name": "Source Normalized Impact per Paper",
            "range": {
              "low": 0.000,
              "high": 10.000
            },
            "format": "0.000",
            "goal": "max",
            "is_objective": true
        }
    ];
    var subject = "Researcher Ranking";

    var problem = {
        columns: columns,
        subject: subject,
        options: options
    };

    return tradeoffResource.getDilemmas(problem);
};
