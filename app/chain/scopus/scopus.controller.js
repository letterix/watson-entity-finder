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
        ,'count': 2
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
exports.searchArticles = function(search) {
    console.time('scopusSearch');
    return scopusController.search(search)
        .then(function(res) {
            console.timeEnd('scopusSearch');
            console.time('mapIssn');
            return res;
        })
        .then(mapIssn)
        .then(function(res) {
            console.timeEnd('mapIssn');
            console.time('mapAuthors');
            return res;
        })
        .then(mapAuthors)
        .then(function(res) {
            console.timeEnd('mapAuthors');
            return res;
        })
};
/*
exports.getTradeoff = function(search) {
    return scopusController.getInfo(search)
        .then(tradeoffController.getDilemmas);    
}
*/
// HELPER FUNCTIONS
// ====================================================
function retrieveAbstract(article) {
    return scopusController.retrieveLink(article['link'][0]['@href']);    
}

// MAP ISSN
// ====================================================

function mapIssn(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, utils.undefinedFieldFilter('affiliation'))
        .map(function(entry) {
            var issn = entry['prism:eIssn'];
            if (issn === undefined) {
                issn = entry['prism:issn'];
            }

            return scopusController.retrieveIssn(issn)
                .then(mapIssnData)
                .then(utils.setFieldForObject('issn', entry))
                .catch(function(result) {
                    console.log("Catch in mapIssn: " + result)
                }); // Catching undefined response from retrieveIssn
        })
        .filter(utils.undefinedFilter)
}

function mapIssnData(issnBody) {
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

// MAP AUTHORS
// ====================================================

function mapAuthors(articles) {
    var authorMap = {};
    return Promise.map(articles, mapAuthor(authorMap))
        .return(authorMap)
}

function mapAuthor(authorMap) {
    return function(article) {
        return retrieveAbstract(article)
            .then(mapAuthorsFromAbstract(authorMap, article))
            .catch(function(error) {
                console.log("Catch in mapAuthor: " + error);
            });    
    }
}

function mapAuthorsFromAbstract(authorMap, article) {
    return function(abstract) {
        return Promise.map(abstract['abstracts-retrieval-response']['authors']['author'], function(author) {
            if (!authorMap[author['@auid']]) {
                authorMap[author['@auid']] = [];
            }

            authorMap[author['@auid']].push(article);
        });
    };
}
