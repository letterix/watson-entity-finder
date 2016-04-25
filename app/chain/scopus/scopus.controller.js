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
        ,'field': 'affiliation,dc:creator,dc:title,prism:issn,prism:eIssn,prism:isbn,dc:creator,affiliation,author,prism:publicationName,citedby-count'
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

exports.retrieveAuthorBatch = function(authorBatchString) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'author_id': authorBatchString,
        'view': 'ENHANCED'
    };

    // authorBatchString ex: '102615177, 102615178'
    return scopusResource.retrieveAuthorBatch(params);
};

exports.retrieveAuthorHIndexBatch = function(authorBatchString) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json',
        'author_id': authorBatchString,
        'view': 'METRICS',
        'field': 'h-index,dc:identifier'
    };

    // authorBatchString ex: '102615177, 102615178'
    return scopusResource.retrieveAuthorBatch(params);
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
    return exports.search(search, 0, 25)
        .then(utils.extractFieldValue(['search-results','entry']))
        .map(forceIssn)
        .then(batchFetchIssn)
        .then(groupByAuthor)
        .then(getEntityList)
        .map(removeDoubleArticles)
        .then(prepareForFirstRanking);
};

/**
 * Retrieves all articles for the search query "search".
 * Gets the issn for all articles
 * Groups the articles by each author
 * Lastly prepares the result for ranking
 */
exports.loopSearch = function(search, numRes) {
    return exports.search(search, 0, 1)
        .then(loopSearcher(search))
        .then(putTogetherArticles)
        .then(groupByAuthor)
        .then(getEntityList)
        .map(removeDoubleArticles)
        .then(prepareForFirstRanking)
        .then(rankController.rank) // Send to rank
        .then(getHIndexBatches)
        .then(prepareForSecondRanking)
        .then(rankController.rank) // Send to rank
        .then(getAuthors(numRes));
}

// HELPER FUNCTIONS FOR LOOP SEARCH
// ====================================================

function tempAfterRank(res) {
    return new Promise(function(resolve) {
        resolve(res['entities']);
    });
}

/**
 * Takes the search query "search" and a search result object "res" as parameters.
 * Synchronously retrieves all search results with 25 articles each for the search query "search".
 * When all results are retrieve it then adds them to a list and returns the list.
 */
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

/**
 * Takes a search query "search" and a integer start as parameters.
 * Sends out a search request with the search query "search" to rerieve 25 articles form "start".
 * When the result is retrieve it then gets the issn for all articles.
 */
function searchAndGetIssn(search, start) {
    return exports.search(search, start, 25)
        .then(utils.extractFieldValue(['search-results','entry']))
        .map(forceIssn)
        .then(batchFetchIssn);
}

/**
 * Takes a search query "search" and a integer start as parameters.
 * Sends out a search request with the search query "search" to rerieve 25 articles form "start".
 * When the result is retrieve it then gets the issn for all articles.
 */
function putTogetherArticles(results) {
    var articleList = [];
    return Promise.map(results, function(articles) {
        articles.forEach(function(article) {
            if (!!article['author']) {
                articleList.push(article);
            }
        });
    })
    .return(articleList);
}

// HELPER FUNCTIONS
// ====================================================

function retrieveAbstract(article) {
    return exports.retrieveLink(article['link'][0]['@href']);
}

// BATCH FETCH ISSN
// ====================================================

function batchFetchIssn(articles) {
    return extractIssns(articles)
        .then(exports.retrieveIssnBatch)
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

function prepareForFirstRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','issn','SJRList', 'SJR', '$'],
                weight: 1
            },
            {   fields: ['articles','citedby-count'],
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

// GET H-INDEX AND PREPARE FOR SECOND RANKING
// ====================================================

function getHIndexBatches(authors) {
    return new Promise(function(resolve) {
        var resultList = [];
        var count = (authors.length/100);
        if (count > 5) {
            count = 5;
        }
        for (var i = 0; i < count; ++i) {
            var theAuthors = authors.splice(0, 100);
            resultList.push(extractAuthors(theAuthors)
                            .then(exports.retrieveAuthorHIndexBatch)
                            .then(matchAuthor(theAuthors)));
        };
        Promise.all(resultList).then(function() {
            console.log("all the h-indexes retrieved and matched");
            return (resultList);
        })
        .then(putTogetherBatches)
        .then(function(res) {
            resolve(res);
        });
    });
}

function extractAuthors(authors) {
    var authorBatchString = '';
    return Promise.map(authors, function(author) {
        authorBatchString += author['id'] + ',';
    })
    .then(function(res) {
        return authorBatchString;
    });
}

function matchAuthor(authors) {
    return function(hindexes) {
        var hindexes = hindexes['author-retrieval-response-list']['author-retrieval-response'];
        return Promise.all([utils.sortByField(authors, 'id'), sortByAuthorID(hindexes)])
            .then(function() {
                return new Promise(function(resolve) {
                    var innerIndex = 0;
                    for (var i = 0; i < hindexes.length; i++) {
                        for (var j = innerIndex; j < authors.length; j++) {
                            if (hindexes[i]['coredata']['dc:identifier'] === 'AUTHOR_ID:'+authors[j]['id']) {
                                if (authors[i]['h-index'] === undefined) {
                                    authors[i]['h-index'] = hindexes[j]['h-index'];
                                }
                                else {
                                    authors[i]['author'] = hindexes[j];
                                }
                                innerIndex = j+1;
                                break;
                            };
                        };
                    };

                    return resolve(authors);
                });
            });
    }
}

function sortByAuthorID(hindexes) {
    return new Promise(function(resolve) {
        hindexes.sort(function(a, b) {
            if (a['coredata']['dc:identifier'] < b['coredata']['dc:identifier']) {
                return -1;
            }
            return 1;
        });

        return resolve(hindexes);
    });
}

function putTogetherBatches(batches) {
    var resultList = [];
    return Promise.map(batches, function(batch) {
        batch.forEach(function(article) {
            resultList.push(article);
        });
    })
    .return(resultList);
}

function prepareForSecondRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['h-index'],
                weight: 1
            }
        ],
        weightFields: []
    };

    return new Promise(function(resolve) {
        return resolve(rank);
    });
}

// GET AUTHORS
// ====================================================

function getAuthors(numRes) {
    return function(authors) {
        var topAuthors = authors.splice(0, numRes);
        return extractAuthors(topAuthors)
            .then(exports.retrieveAuthorBatch)
            .then(matchAuthor(topAuthors));
    }
}

// FILTER
// ====================================================

function filterUndefinedIssn(article) {
    return !!article['issn']['issn'];
}
