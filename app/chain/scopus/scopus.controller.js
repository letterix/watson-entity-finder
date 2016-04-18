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
exports.search = function(query, start, count) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY
        ,'httpAccept': 'application/json'
        ,'query': query
        ,'count': count
        ,'date': '2004-2016'
        ,'subj': 'MEDI'
        ,'start': start
        ,'view': 'COMPLETE'
        ,'field': 'affiliation,dc:creator,dc:title,prism:issn,prism:eIssn,prism:isbn,dc:creator,affiliation,author'
    };

    // SEARCH TIPS
    /*
    ALL("heart attack") returns documents with "heart attack" in any of the fields listed.
    ABS(dopamine)returns documents where "dopamine" is in the document abstract.
    The search TITLE-ABS-KEY(prion disease) returns documents where the terms appear in the title, keywords, or abstract.

    AFFIL(nure?berg) finds Nuremberg, Nurenberg
    behav* finds behave, behavior, behaviour, behavioural, behaviourism, etc.
    *tocopherol finds α-tocopherol, γ-tocopherol , δ-tocopherol, tocopherol, tocopherols, etc.
    */

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
        'issn': issnBatchString,
        'field': 'SJR,prism:issn,prism:eIssn'
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
    return scopusController.search(search, 0, 25)
        .then(utils.extractFieldValue(['search-results','entry']))
        .map(forceIssn)
        .then(batchFetchIssn)
        .then(utils.sameEntityFilter)
        .then(groupByAuthor)
        .then(getEntityList)
        .map(removeDoubleArticles)
        .then(prepareForRanking);
};

exports.loopSearch = function(search) {
    return scopusController.search(search, 0, 1)
        .then(loopSearcher(search))
        .then(putTogetherResults)
        .then(groupByAuthor)
        .then(getEntityList)
        .map(removeDoubleArticles)
        .then(prepareForRanking);
}

// HELPER FUNCTIONS FOR LOOP SEARCH
// ====================================================

function loopSearcher(search) {
    return function(res) {
        return new Promise(function(resolve) {
            var count = Math.ceil(res['search-results']['opensearch:totalResults']/25);
            console.log("Available results: " + res['search-results']['opensearch:totalResults']);
            var resultList = [];
            for (var i = 0; i < count; ++i) {
                var start = i*25;
                resultList.push(searchAndGetIssn(search, start));
            };
            Promise.all(resultList).then(function() {
                console.log("all the searchers are done");
                resolve(resultList);
            });
        });
    };
}

function searchAndGetIssn(search, start) {
    return scopusController.search(search, start, 25)
        .then(utils.extractFieldValue(['search-results','entry']))
        .map(forceIssn)
        .then(batchFetchIssn)
        .then(utils.sameEntityFilter);
}

function putTogetherResults(results) {
    var articleList = [];
    return Promise.map(results, function(articles) {  
        articles.forEach(function(article) {
            if (article['author'] != undefined) {
                articleList.push(article);   
            }  
        });     
    })
    .return(articleList);
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
        .filter(utils.undefinedFieldFilter('issn'))
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
        if (typeof issn === 'string') {
            issn = issn.replace('-','');
        }

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
            var newArticle = article;
            delete newArticle['author'];
            authorMap[author['authid']]['articles'].push(newArticle);            
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

function removeDoubleArticles(author) {
    var articleMap = {};
    return Promise.each(author.articles, function(article) {
        articleMap[article['issn']['issn']] = article;
    })
    .then(function() {
        return Promise.map(Object.keys(articleMap), function(key) {
            return articleMap[key];
        });
    })
    .then(function(articles) {
        author['articles'] = articles;
        return author;
    })
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
