/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var config = require('config');
var msResource = require('./msacademic.resource');
var errorHandler = require('../../handler/error.handler');
var utils = require('../../utility/utils');

// DOES EXPORT
// ====================================================

exports.search = function(query) {
    var params = {
        'model' : 'latest',
        'count' : '500', //getting 500 articles as default
        'attributes' : 'Ti,CC,AA.AuN,AA.AuId,AA.AfN,J.JN',//Getting titles for now
        'expr': 'AND(Y>2010, '+query+')'
    };
    return msResource.search(params)
    .then(parseAcademicResult)
    .then(utils.extractValuesFromMap);
};

// DOES NOT EXPORT
// ====================================================

function parseAcademicResult(searchResult){
    var authors = {};
    return Promise.map(searchResult['entities'], function(entity) {
      return Promise.map(entity['AA'], function(author) {
        if(!authors[author['AuId']]){
          authors[author['AuId']] = {
            'name' : author['AuN'],
            'affiliation' : author['AfN'],
            'id' : author['AuId'],
            'articles' : []
          };
        };
        if(!authors[author['AuId']]['affiliation']){
          authors[author['AuId']]['affiliation'] = author['AfN'];
        }
        authors[author['AuId']]['articles'].push({
          'title' : entity['Ti'],
          'citationCount' : entity['CC'],
          'journal' : (entity['J']) ? entity['J']['JN'] : 'unclear'
        });
      });
    })
    .return(authors);
}

function prepareForFirstRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','citationCount'],
                weight: 1
            }
        ],
        weightFields: [
            {   fields: ['articles', 'journal'],
                weight: 1
            },
            {   fields: ['affiliation'],
                weight: 1
            }

        ]
    };

    return new Promise(function(resolve) {
        return resolve(rank);
    });
}
