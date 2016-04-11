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

exports.search = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY
        ,'httpAccept': 'application/json'
        ,'query': query
        ,'count': 20
        ,'date': '2010-2016'
        ,'subj': 'MEDI'
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

exports.retrieveLink = function(link) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    // link ex: 'http://api.elsevier.com/content/abstract/scopus_id/84960111013'
    return scopusResource.retrieveLink(link, params);
};

// Calls with post work
// ====================================================
exports.getSearchInfo = function(search) {
    return scopusController.search(search)
        .then(searchInfo);
};

exports.getAllAbstracts = function(search) {
    return scopusController.search(search)
        .then(getAbstracts);
};

exports.getAllIssn = function(search) {
    return scopusController.search(search)
        .then(getIssn);
};

exports.getInfo = function(search) {
    return scopusController.search(search)
        .then(extractInfo);
};
/*
exports.getTradeoff = function(search) {
    return scopusController.getInfo(search)
        .then(tradeoffController.getDilemmas);    
}
*/
// HELPER FUNCTIONS
// ====================================================
function searchInfo(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(entry) {
            return new Promise(function(resolve, reject) {
                return resolve({
                    name: entry['dc:creator'],
                    affiliation: entry.affiliation[0],
                    citedBy: entry['citedby-count'],
                    publishedIn: entry['prism:aggregationType'],
                    publishedBy: entry['prism:publicationName'],
                    type: entry['subtypeDescription']
                });
            });
        });
}

function getAbstracts(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, filterNoLinks)
        .map(function(entry) {
            return scopusController.retrieveLink(entry['link'][0]['@href']);
        })
}

function getIssn(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(entry) {
            var issn = entry['prism:eIssn'];
            if (issn === undefined) {
                issn = entry['prism:issn'];
            }

            return scopusController.retrieveIssn(issn)
                .then(getIssnData)
                .catch(function(result) {
                    console.log("Catch in getIssn: " + result)
                }); // Catching undefined response from retrieveIssn
        })
        .filter(utils.undefinedFilter)
}

function getIssnData(issnBody) {
    return new Promise(function(resolve, reject) {
        var res = issnBody['serial-metadata-response']['entry'][0];
        var result = {
            IPP: Number(res['IPPList']['IPP'][0]['$']),
            SJR: Number(res['SJRList']['SJR'][0]['$']),
            SNIP: Number(res['SNIPList']['SNIP'][0]['$'])
        };

        return resolve(result);
    })
}

function extractInfo(jsonBody) {
    var mapList = {};
    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(article) {
            var issn = article['prism:eIssn'];
            if (issn === undefined) {
                issn = article['prism:issn'];
            }

            return scopusController.retrieveIssn(issn)
                .then(getIssnData)
                .then(addInfoFromSearchResult(article))
                .then(getAuthorsByLink(article['prism:url'], mapList))
                .catch(function(result) {
                    console.log("Catch in extractInfo: " + result)
                }) // Catching undefined response from retrieveIssn
        })
        .return(mapList);
}

function addInfoFromSearchResult(article) {
    return function(issn) {
        return new Promise(function(resolve, reject) {
            issn.citedBy = Number(article['citedby-count']);
            var object = {
                key: article['eid'],
                name: article['dc:creator'],
                values: issn,
                affiliation: article.affiliation[0],
                publishedIn: article['prism:aggregationType'],
                publishedBy: article['prism:publicationName'],
                type: article['subtypeDescription']
            }

            return resolve(object);
        })
    }
}

function getAuthorsByLink(link, mapList) {
    return function(article) {
        return scopusController.retrieveLink(link)
            //.then(utils.setFieldForObject('authors', article))
            .then(mapAuthorsFromAbstract(mapList, article))
            .catch(function(error) {
                console.log("Catch in getAuthorsByLink: " + error);
            });
    }
}

function mapAuthorsFromAbstract(mapList, article) {
    return function(abstract) {
        console.log("abstract: " + Object.keys(abstract['abstracts-retrieval-response']['authors']));
        return Promise.map(abstract['abstracts-retrieval-response']['authors']['author'], function(author) {
            console.log(author['@auid']);
            if (!mapList[author['@auid']]) {
                mapList[author['@auid']] = [];
            }

            mapList[author['@auid']].push(article);
        })
        .return(mapList);
    };
}

function filterNoAffiliations(entry) {
    return !!entry.affiliation;
}

function filterNoLinks(entry) {
    return !!entry.link;
}

function filterNoIssn(entry) {
    return !!entry.prism.issn;
}
