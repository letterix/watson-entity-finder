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
var noOfArticlesReturned = config.RESOURCE_MSACADEMIC_NO_OF_ARTICLES_RETURNED;
var searchReturnParameters = config.RESOURCE_MSACADEMIC_SEARCH_RETURN_PARAMETERS;

// DOES EXPORT
// ====================================================

exports.search = function(query) {
    var params = {
        'model' : 'latest',
        'count' : noOfArticlesReturned, //getting 500 articles as default
        'attributes' : searchReturnParameters,//Getting titles for now
        'expr': 'AND(Y>2010, '+query+')'
    };

    return msResource.search(params)
    .then(parseAcademicResult)
    .then(utils.extractValuesFromMap);
};

//Parses the result from the search into a kv-map mapping the ID of an author
//to information about him and any articles he contributed to returned by the
//search.
function parseAcademicResult(searchResult){
    var authors = {};
    return Promise.map(searchResult['entities'], function(entity) {
      return Promise.map(entity['AA'], function(author) {
        if (!authors[author['AuId']]) {
          authors[author['AuId']] = {
            'name' : author['AuN'],
            'affiliation' : author['AfN'],
            'id' : author['AuId'],
            'articles' : []
          };
        }

        if (!authors[author['AuId']]['affiliation']) {
          authors[author['AuId']]['affiliation'] = author['AfN'];
        }

        authors[author['AuId']]['articles'].push({
          'title' : entity['Ti'],
          'citationCount' : entity['CC'],
          'journalName' : (entity['J']) ? entity['J']['JN'] : null
        });
      });
    })
    .return(authors);
}

//Formats the author->[article] map into the format needed for the ranker
function prepareForFirstRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','citationCount'],
                weight: 1
            }
        ],
        weightFields: [
            {   fields: ['articles', 'journalName'],
                weight: 1
            },
            {   fields: ['affiliation'],
                weight: 1
            }

        ]
    };

    return rank;
}
