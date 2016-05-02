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
        'expr': "AND(Y>2009,W='"+query+"')"
    };

    return msResource.search(params)
    .then(getAuthorIdToAuthorMap);
    //.then(composeRankFormat);
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
function getAuthorIdToAuthorMap(searchResult){
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
          'subjectArea' : (entity['F']) ? entity['F'] : null,
          'citationCount' : entity['CC'],
          'journalName' : (entity['J']) ? entity['J']['JN'] : null,
          'DOI' : (JSON.parse(entity['E'])['DOI']) ? JSON.parse(entity['E'])['DOI'] : null
        });
      });
    })
    .return(authors);
}

/**
* DESCRIPTION: Formats an authorId->author map to enable ranking of it.
*
* @param entityList: An authorId->author map containing fields suitable for
*        ranking the authors.
* @return: an object containing the map along with fields specifying how the
*         authors should be ranked.
*/
function composeRankFormat(entityList) {
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
