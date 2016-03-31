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

// DOES EXPORT
// ====================================================

exports.search = function(query) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY
        ,'httpAccept': 'application/json'
        ,'query': query
        ,'count': 20
        ,'date': '2005-2016'
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

exports.getTradeoff = function(search) {
    return scopusController.getInfo(search)
        .then(tradeoffController.getDilemmas);    
}

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
                .then(getIssnData);
        })
}

function getIssnData(issnBody) {
    if (issnBody === undefined) {
        var result = {
            IPP: 0,
            SJR: 0,
            SNIP: 0
        }
    } else {
        var res = issnBody['serial-metadata-response']['entry'][0];
        var result = {
            IPP: Number(res['IPPList']['IPP'][0]['$']),
            SJR: Number(res['SJRList']['SJR'][0]['$']),
            SNIP: Number(res['SNIPList']['SNIP'][0]['$'])
        };
    }

    return new Promise(function(resolve, reject) {
        return resolve(result);
    })
}

function extractInfo(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(entry) {
            var issn = entry['prism:eIssn'];
            if (issn === undefined) {
                issn = entry['prism:issn'];
            }

            return scopusController.retrieveIssn(issn)
                .then(getIssnData)
                .then(function(res) {
                    return addInfoFromSearchResult(entry, res);
                });
        })
}

function addInfoFromSearchResult(entry, values) {
    values.citedBy = Number(entry['citedby-count']);
    var object = {
        key: entry['eid'],
        name: entry['dc:creator'],
        values: values,
        affiliation: entry.affiliation[0],
        publishedIn: entry['prism:aggregationType'],
        publishedBy: entry['prism:publicationName'],
        type: entry['subtypeDescription']
    }

    return new Promise(function(resolve, reject) {
        return resolve(object);
    })
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
