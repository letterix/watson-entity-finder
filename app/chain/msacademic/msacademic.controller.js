/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var config = require('config');
var msResource = require('./msacademic.resource');
var rankController = require('../rank/rank.controller');
var errorHandler = require('../../handler/error.handler');
var utils = require('../../utility/utils');
var noOfArticlesReturned = config.RESOURCE_MSACADEMIC_NO_OF_ARTICLES_RETURNED;
var searchReturnParameters = config.RESOURCE_MSACADEMIC_SEARCH_RETURN_PARAMETERS;

// DOES EXPORT
// ====================================================

exports.search = function(query, numRes) {
    var params = {
        'model' : 'latest',
        'count' : 500, //getting 500 articles as default
        'attributes' : searchReturnParameters,//Getting titles for now
        'expr': 'AND(Y>2010,' + "W='" + query + "')"
    };

    return msResource.search(params)
        .then(groupByAuthor)
        .then(utils.extractValuesFromMap)
        .then(prepareForRanking)
        .then(rankController.rank);
};
/**
* DESCRIPTION: Takes the result from a msAcademic search and returns a map of
* authorId->author, where each author object is
* {
*   'name' : <authorName>,
*   'affiliation' : <authorAffiliation>,
*   'id' : <authorId>,
*   'articles' : <List of articles in the result of the search>
* }
*
* @param searchResult The result of a search in microsoft academic. If a parameter
*        in the author object isn't available, it will be excluded from the object.
* @return: A map of author IDs to authors
* {
*   <authorId> : <author>,
*   <authorId> : <author>
* }
* where the authorId is unique integers and the <author> objects follows the
* pattern explained in the DESCRIPTION.
*/
function groupByAuthor(searchResult){
    return Promise.reduce(searchResult['entities'], function(map, entity) {
        entity['AA'].forEach(function(author) {
            if (!map[author['AuId']]) {
                map[author['AuId']] = {
                    'name' : author['AuN'],
                    'affiliation' : author['AfN'],
                    'id' : author['AuId'],
                    'articles' : []
                };
            }

            if (!map[author['AuId']]['affiliation']) {
                map[author['AuId']]['affiliation'] = author['AfN'];
            }

            map[author['AuId']]['articles'].push({
                'title' : entity['Ti'],
                'citedby-count' : entity['CC'],
                'journalName' : (entity['J']) ? entity['J']['JN'] : null,
                'DOI' : (entity['E']) ? JSON.parse(entity['E'])['DOI'] : null
            });
        });

        return map;
    }, {});
}

/**
* DESCRIPTION: Formats an authorId->author map to enable ranking of it.
*
* @param entityList: An authorId->author map containing fields suitable for
*        ranking the authors.
* @return: an object containing the map along with fields specifying how the
*         authors should be ranked.
*/
function prepareForRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','citedby-count'],
                multiplier: 1
            },
            {   fields: ['articles','DOI'],
                weight: 1,
                multiplier: 1
            }
        ],
        weightFields: [
            {   fields: ['articles', 'journalName'],
                multiplier: 1
            }
        ]
    };

    return rank;
}
