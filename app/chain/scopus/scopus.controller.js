/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var scopusResource = require('./scopus.resource');
var rankController = require('../rank/rank.controller');
var tradeoffController = require('../tradeoff-analytics/tradeoff.controller');
var errorHandler = require('../../handler/error.handler.js');
var config = require('config');
var utils = require('../../utility/utils');


/**
 * Used by scopus to determine what fields to return given a query
 */
var views = {
    ENHANCED: "ENHANCED",
    METRICS: "METRICS",
    COMPLETE: "COMPLETE"
};

// DOES EXPORT
// ====================================================


// SCOPUS SEARCH
// ====================================================

/**
 * DESCRIPTION: Retrieves all articles for the search query "search".
 * Groups the articles by each author
 * Lastly prepares the result for ranking
 *
 * @param search (String): the search query to pass to scopus search
 * @param numRes (Int): the number of top results to return
 */
exports.search = function(search, numRes) {
    return limitedSearch(search, 0, 1)
        .then(loopSearcher(search))
        .then(groupByAuthor)
        .then(getFullAuthorObjects)
        .then(prepareForRanking)
        .then(rankController.rank); // Send to rank
}

// AUTHOR SEARCH/RETRIEVAL
// ====================================================

/**
 * DESCRIPTION: Retrieves an author given his/her id.
 *
 * @param id (String): the id of the author
 */
exports.retrieveAuthor = function(id) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    return scopusResource.retrieveAuthor(id, params);
};

/**
 * DESCRIPTION: Retrieves authors given a csv string of author id's.
 *
 * @param authorsIdsCsv (String): the csv author id's
 * @return [] an Array of author objects
 */
exports.retrieveAuthorByCsv = function(authorsIdsCsv) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'author_id': authorsIdsCsv,
        'view': views.ENHANCED,
        'field': 'document-count,citedby-count,citations-count,affiliation-current,h-index,coauthor-count,author-profile,dc:identifier'
    };

    // authorsIdsCsv ex: '102615177, 102615178'
    return scopusResource.retrieveAuthorByCsv(params)
        .then(utils.extractFieldValue(['author-retrieval-response-list','author-retrieval-response']));;
};

// ARTICLE RELATED (DEPRECATED)
// ====================================================

exports.retrieveAbstract = function(title) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    // title ex: '10.1016/j.anbehav.2015.12.020'
    return scopusResource.retrieveAbstract(title, params);
};

exports.retrieveArticle = function(eid) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    // eid ex: '1-s2.0-S000334721500473X'
    return scopusResource.retrieveArticle(eid, params);
};

exports.retrieveLink = function(link) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    // link ex: 'http://api.elsevier.com/content/abstract/scopus_id/84960111013'
    return scopusResource.retrieveLink(link, params);
};

// DOES NOT EXPORT
// ====================================================

/**
* DESCRIPTION: Performs a single scopus search and returns the results in the
* span of start to (start+count).
*
* SEARCH TIPS:

* ALL("heart attack") returns documents with "heart attack" in any of the fields listed.
* ABS(dopamine)returns documents where "dopamine" is in the document abstract.
* The search TITLE-ABS-KEY(prion disease) returns documents where the terms appear in the title, keywords, or abstract.

* AFFIL(nure?berg) finds Nuremberg, Nurenberg
* behav* finds behave, behavior, behaviour, behavioural, behaviourism, etc.
* *tocopherol finds α-tocopherol, γ-tocopherol , δ-tocopherol, tocopherol, tocopherols, etc.
*
* @param String query: the query to pass onto scopus
* @param int start: the index from which to use as head of the results
* @param int count: the number of results to return
* @return: the result from the search (Object)
*/
function limitedSearch(query, start, count) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY
        ,'httpAccept': 'application/json'
        ,'query': query
        ,'count': count
        ,'date': '2006-2016'
        ,'subj': 'MEDI'
        ,'start': start
        ,'view': views.COMPLETE
        ,'field': 'affiliation,dc:creator,dc:title,prism:issn,prism:eIssn,prism:isbn,dc:creator,affiliation,author,prism:publicationName,citedby-count,prism:doi,pubmed-id'
    };

    return scopusResource.search(params);
};

/**
 * DESCRIPTION: Takes a scopus query and a search result object as parameters, reads the number
 * of available results from the "res" object and synchronously retrieves all of the results.
 * When all results are retrieve it then adds them to a list and returns the list.
 *
 * @param String query: the query to pass onto scopus
 * @param res: the initial search response from scopus
 * @return: an array containing all of the search results
 */
function loopSearcher(query) {
    return function(res) {
        return new Promise(function(resolve) {

            var count = Math.ceil(res['search-results']['opensearch:totalResults']/100);
            count = count > 5 ? 5 : count; // Limit the number of results (damnit scopus!)
            console.log("Available results: " + res['search-results']['opensearch:totalResults']);

            var resultList = [];
            for (var i = 0; i < count; ++i) {
                var start = i*100;
                resultList.push(limitedSearch(query, start, 100)
                    .then(utils.extractFieldValue(['search-results','entry'])));
            };

            return Promise.all(resultList)
                .then(utils.flatten)
                .filter(utils.undefinedFieldFilter('author'))
                .map(utils.renameFieldForObject('prism:doi', 'doi'))
                .map(utils.renameFieldForObject('dc:title', 'title'))
                .map(utils.renameFieldForObject('prism:publicationName', 'journalName'))
                .then(resolve);
        });
    };
}

// GROUP BY AUTHORS
// ====================================================

/**
* DESCRIPTION: Takes a list of articles and groups them by their authors.
* Further filters double articles from the grouped authors.
*
* @param articles[]: An array containing the articles
* @return: An array containing authors with the field articles containing
* the articles for said author.
*/
function groupByAuthor(articles) {
    return Promise.reduce(articles, function(map, article) {
        article['author'].forEach(function(author) {
            if (!map[author['authid']]) {
                map[author['authid']] = {
                    articles: [],
                    id: author['authid']
                };
            };

            var newArticle = article;
            delete newArticle['author'];
            map[author['authid']]['articles'].push(newArticle);
        });
        return map;
    }, {})
    .then(utils.extractValuesFromMap)
    .map(removeDoubleArticles);
}

/**
* DESCRIPTION: Takes an author object and removes any double occuring articles.
*
* @param author{}: An author object containing a list of articles
* @return: An author object containing a clean set of articles
*/
function removeDoubleArticles(author) {
    return utils.getSetOfObjectsByField('title')(author.articles)
        .then(utils.setFieldForObject('articles', author));
}

// EXTEND THE
// ====================================================

/**
* DESCRIPTION: Takes a list of author objects with atleast and id field
* and returns a list of more detailed author objects; matching those id's.
*
* @param authors[]: An array of authors caontaining atleast an id field.
* @return: An array of more detailed author objects, containing atleast all
* the information as the input.
*/
function getFullAuthorObjects(authors) {
    return new Promise(function(resolve) {
        var resultList = [];
        var count = Math.ceil(authors.length / 25);
        for (var i = 0; i < count; ++i) {
            var authorsCut = authors.splice(0, 25);
            resultList.push(
                utils.getListCsv('id')(authorsCut)
                    .then(exports.retrieveAuthorByCsv)
                    .map(utils.moveNestedObjFieldsToParent('coredata'))
                    .map(utils.moveNestedObjFieldsToParent('author-profile'))
                    .filter(utils.undefinedFieldFilter('preferred-name'))
                    .map(setNameForAuthor)
                    .map(pruneAuthorFields)
                    .then(matchAuthorObjects(authorsCut))
            );
        };
        return Promise.all(resultList)
            .tap(utils.printPromiseProgress("all the h-indexes retrieved and matched"))
            .then(utils.flatten)
            .then(resolve);
    });
}


/**
 * DESCRIPTION: Sorts and matches two arrays of author objects returned from scopus.
 * Upon being matched, all the fields from the first (old) object is passed onto the
 * second (new) object and the function updates the start index for the next iteration.
 *
 * @param oldAuthors[]: an array of authors containing atleast an id field
 * @param newAuthors[]: an array of authors containing atleast an dc:identifier field
 * @return: an array containing all of the merged author objects
 */
function matchAuthorObjects(oldAuthors) {
    return function(newAuthors) {
        oldAuthors = utils.sortByField('id')(oldAuthors);
        newAuthors = utils.sortByField('dc:identifier')(newAuthors);
        return Promise.all([oldAuthors, newAuthors])
            .then(function() {
                return new Promise(function(resolve) {
                    oldAuthors = oldAuthors.value();
                    newAuthors = newAuthors.value();
                    var innerIndex = 0;
                    for (var i = 0; i < newAuthors.length; i++) {
                        for (var j = innerIndex; j < oldAuthors.length; j++) {
                            if (newAuthors[i]['dc:identifier'] === 'AUTHOR_ID:'+oldAuthors[j]['id']) {
                                newAuthors[i] = utils.moveFieldsFromObj(oldAuthors[j], newAuthors[i]);
                                innerIndex = j+1;
                                break;
                            };
                        };
                    };

                    return resolve(newAuthors);
                });
            });
    }
}

// HELPER FUNCTIONS
// ====================================================

function setNameForAuthor(author) {
    var surName = author['preferred-name']['surname'];
    var givenName = author['preferred-name']['given-name'];
    author['name'] = givenName + ' ' + surName;
    return author;
}

function prepareForRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','citedby-count'],
                multiplier: 1
            },
            {   fields: ['h-index'],
                multiplier: 1
            }
        ],
        weightFields: [
            {   fields: ['articles', 'journalName'],
                multiplier: 1
            }
        ]
    };

    return rank
}

function pruneAuthorFields(author) {
    delete author['@_fa'];
    delete author['@status'];
    delete author['status'];
    delete author['date-created'];
    delete author['preferred-name'];
    delete author['name-variant'];
    delete author['classificationgroup'];
    delete author['publication-range'];
    delete author['journal-history'];
    delete author['affiliation-history'];
    return author;
}
