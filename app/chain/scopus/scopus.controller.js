/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var scopusResource = require('./scopus.resource');
var scopusController = require('./scopus.controller');
var tradeoffController = require('../tradeoff-analytics/tradeoff.controller');
var errorHandler = require('../../handler/error.handler.js');
var config = require('config');
var utils = require('../../utility/utils');

// DOES EXPORT
// ====================================================
exports.search = function(query, start) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY
        ,'httpAccept': 'application/json'
        ,'query': query
        ,'count': 20
        ,'date': '2004-2016'
        ,'subj': 'MEDI'
        ,'start': start
//        ,'view': 'COMPLETE'
    };

    return scopusResource.search(params);
};

exports.authorSearch = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'query': query
    };

    return scopusResource.authorSearch(params);
};

exports.retrieveAuthor = function(id) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    return scopusResource.retrieveAuthor(id, params);
};

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

exports.retrieveIssn = function(issn) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    // issn ex: '102615177'
    return scopusResource.retrieveIssn(issn, params);
};

exports.retrieveIssnBatch = function(issnBatchString) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'issn': issnBatchString
    };

    // issnBatchString ex: '102615177, 102615178'
    return scopusResource.retrieveIssnBatch(params);
};

exports.retrieveLink = function(link) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    // link ex: 'http://api.elsevier.com/content/abstract/scopus_id/84960111013'
    return scopusResource.retrieveLink(link, params);
};

// Exports with post work
// ====================================================

exports.searchArticles = function(search, numRes) {
    return scopusController.search(search, 0)
        .then(utils.extractFieldValue(['search-results','entry']))
        .map(forceIssn)
        .then(batchFetchIssn)
        .then(groupByAuthor)
        .then(getEntityList)
        .then(prepareForRanking);
};

exports.loopSearch = function(search) {
    var resultList = [];
    return scopusController.search(search, 0)
        .then(function(res) {
                resultList.push(res);
                var count = res['search-results']['opensearch:totalResults'] - 100;
                console.log("count: " + count + " start: " + 100);
                return count;
        })
        .then(searchLooper(search, resultList, 100))
        .then(function(res) {
            return res;
        });
}

function searchLooper(search, resultList, start) {
    return function(count) {
        if (count > 0) { 
            var newStart = start + 100;
            scopusController.search(search, start)
            .then(function(res) {
                    resultList.push(res);
                    count = res['search-results']['opensearch:totalResults'] - newStart;
                    console.log("count: " + count + " start: " + newStart);
                    return (count);
            })
            .then(searchLooper(search, resultList, newStart)); 
        }   
        else {
            console.log("Done!")
            return new Promise(function(resolve) {
                return resolve(resultList);
            })
        }
    }
}

// HELPER FUNCTIONS
// ====================================================

function retrieveAbstract(article) {
    return scopusController.retrieveLink(article['link'][0]['@href']);    
}

// BATCH FETCH ISSN
// ====================================================

function batchFetchIssn(articles) {
    return extractIssns(articles)
        .then(scopusController.retrieveIssnBatch)
        .then(utils.extractFieldValue(['serial-metadata-response','entry']))
        .map(forceIssn)
        .then(matchIssns(articles))
        .filter(filterUndefinedIssn);
}

function extractIssns(articles) {
    var issnBatchString = '';
    return Promise.map(articles, function(article) {
        issnBatchString += article['issn'] + ','; 
    }) 
    .then(function(res) {
        return issnBatchString;
    });
}

function forceIssn(entry) {
    return new Promise(function(resolve) {
        var issn = entry['prism:issn'];
        if (issn === undefined) {
            issn = entry['prism:eIssn'];
        };
        if (issn === undefined) {
            issn = entry['prism:isbn'];
        };
        issn = issn.replace('-','');
        entry['issn'] = issn;

        return resolve(entry);
    });
}

function matchIssns(articles) {
    return function(issnBatch) {
        return Promise.all([utils.sortByField(articles, 'issn'), utils.sortByField(issnBatch, 'issn')])
            .then(function() {
                return new Promise(function(resolve) {
                    var innerIndex = 0;
                    for (var i = 0; i < issnBatch.length; i++) {
                        for (var j = innerIndex; j < articles.length; j++) {
                            if (issnBatch[i]['issn'] === articles[j]['issn']) {
                                articles[i]['issn'] = issnBatch[j];
                                innerIndex = j+1;
                                break;
                            };
                        };
                    };

                    return resolve(articles);
                });
            });
    };
}

// GROUP BY AUTHORS
// ====================================================

function groupByAuthor(articles) {
    var authorMap = {};
    return Promise.map(articles, function(article) {
        article['author'].forEach(function(author) {
            if (!authorMap[author['authid']]) {
                authorMap[author['authid']] = {
                    articles: [],
                    id: author['authid']                  
                };
            };
            authorMap[author['authid']]['articles'].push(article);            
        });
    })
    .return(authorMap);
}

// GET ENTITY LIST AND PREPARE FOR RANKING
// ====================================================

function getEntityList(authorMap) {
    return Promise.map(Object.keys(authorMap), function(id) {
        return authorMap[id];
    });
}

function prepareForRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','issn','SJRList', 'SJR', '$'], 
                weight: 1
            }
        ],
        weightFields: [
            {   fields: ['articles', 'prism:publicationName'], 
                weight: 1
            }
        ]
    };

    return new Promise(function(resolve) {
        return resolve(rank);
    });
}

// FILTER
// ====================================================

function filterUndefinedIssn(article) {
    return !!article['issn']['issn'];
}
