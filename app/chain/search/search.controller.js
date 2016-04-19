/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var config = require('config');
var scopusController = require('../scopus/scopus.controller');
var alchemyController = require('../alchemy/alchemy.controller');
var rankController = require('../rank/rank.controller');
var errorHandler = require('../../handler/error.handler.js');
var utils = require('../../utility/utils');

// DOES EXPORT
// ====================================================

exports.search = function(search) {
    return scopusController.loopSearch(search)
        .then(rankController.rank);
};

function extractEntities(jsonBody) {
    return extractAuthors(jsonBody);
}

function extractAuthors(jsonBody) {
    var params = {
        'apikey': config.RESOURCE_SCOPUS_API_KEY,
        'httpAccept': 'application/json'
    };

    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(entry) {
            return setQueryName(entry)('')
                .then(setQueryAffiliations(entry));
                //.then(scopusController.authorSearch);
        });
};

function setQueryName(entry) {
    return function(query) {
        var creator = entry['dc:creator']
        return new Promise(function(resolve) {
            if (creator && creator.indexOf(' ') !== -1) {
                creator = creator.split(' ');
                query += 'AUTHFIRST(' + creator[1].replace('.', '') + ')';
                query += '%20and%20' + 'AUTHLASTNAME(' + creator[0] + ')';
            }

            return resolve(query);
        });
    }
}

function setQueryAffiliations(entry) {
    return function(query) {
        return Promise.map(entry.affiliation, function(affiliation) {
            return new Promise(function(resolve) {
                var res = !!affiliation['affilname'] ? '%20and%20' + 'AFFIL(' + utils.replaceAll(affiliation['affilname'], ' ', '-') + ')' : '';
                res += !!affiliation['affiliation-city'] ? '%20and%20' + 'AFFIL(' + utils.replaceAll(affiliation['affiliation-city'], ' ', '-') + ')' : '';
                res += !!affiliation['affiliation-country'] ? '%20and%20' + 'AFFIL(' + utils.replaceAll(affiliation['affiliation-country'], ' ', '-') + ')' : '';
                return resolve(res);
            })
        }).then(function(results) {
            return query + results.join('');
        });
    }
}

// ========= DEMO FUNCTION ========
function extractDemoEntities(jsonBody) {
    return Promise.filter(jsonBody['search-results'].entry, filterNoAffiliations)
        .map(function(entry) {
            return new Promise(function(resolve, reject) {
                return resolve({
                    name: entry['dc:creator'],
                    affiliation: entry.affiliation[0]
                });
            });
        });
}

// HELPER FUNCTIONS

function filterNoAffiliations(entry) {
    return !!entry.affiliation;
}
