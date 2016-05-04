/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var config = require('config');
var scopusController = require('../scopus/scopus.controller');
var msacademicController = require('../msacademic/msacademic.controller');
var rankController = require('../rank/rank.controller');
var errorHandler = require('../../handler/error.handler.js');
var utils = require('../../utility/utils');

// DOES EXPORT
// ====================================================


/**
 * DESCRIPTION: Master function that controls the combined flows of all the controllers.
 * Currently passes the search to Microsoft Academics and the Scopus database
 *
 * @param search: the search string
 * @returns: a list of ranked entities
 */
exports.search = function(search) {
    var scopusResults = scopusController.search(search, 20);
    var msacademicResults = msacademicController.search(search, 20);
    return Promise.all([scopusResults, msacademicResults])
        .then(utils.flatten)
        .then(groupByAuthor)
        .map(utils.setValueForField('score', 0))
        .then(prepareForRanking)
        .then(rankController.rank)
        .then(utils.retrieveFirstNumValues(20));
};

/**
 * DESCRIPTION: Function that groups the authors from the databses, to see if any of them
 * are the same author.
 *
 * @param authors: the list of authors to check for mergability
 * @returns: a list of (hopefully) unique entities
 */
function groupByAuthor(authors) {
    return Promise.reduce(authors, function(map, author) {
        var key = utils.trimSpecialCharacters(author.name);
        if (!map[key]) {
            map[key] = author;
            return map;
        } else {
            return isSameAuthor(map[key], author)
                .then(function(same) {
                    if (same) {
                        return mergeAuthors(map[key], author)
                            .then(function(author) {
                                console.log('MERGED AUTHOR: ', author.name)
                                map[key] = author;
                                return map;
                            });
                    }

                    var ms = new Date();
                    ms = ms.getTime();
                    key += ms;
                    map[key] = author;
                    return map;
                });
        }
    }, {})
    .then(utils.extractValuesFromMap);
}

/**
 * DESCRIPTION: A master function fo checking whether an author is the same as
 * another one.
 *
 * @param Object first: the first author object
 * @param Object second: the second author object
 * @returns: a boolean value representing if the authors are likly to be the same
 */
function isSameAuthor(first, second) {
    return hasAnyMatchingArticles(first)(second);
}

/**
 * DESCRIPTION: A function that checks if the authors have any matching articles.
 *
 * @param Object first: the first author object
 * @param Object second: the second author object
 * @returns: a boolean value representing if the authors are likly to be the same
 */
function hasAnyMatchingArticles(first) {
    return function(second) {
        return mergeArticles(first, second)
            .then(function(articles) {
                return articles.length != first.articles.concat(second.articles).length;
            })
    }
}

/**
 * DESCRIPTION: A function that merges two author objects into one.
 *
 * @param Object first: the first author object
 * @param Object second: the second author object
 * @returns: the merged author object
 */
function mergeAuthors(first, second) {
    var articles = [].concat(first.articles);
    articles = articles.concat(second.articles);
    return mergeArticles(first, second)
        .then(function(articles) {
            var author = utils.extendSmallestObject(first, second);
            author.articles = articles;
            return author;
        });
}

/**
 * DESCRIPTION: A function that merges the articles of two authos.
 *
 * @param Object first: the first author object
 * @param Object second: the second author object
 * @returns: a list of the merged articles
 */
function mergeArticles(first, second) {
    var articles = first.articles.concat(second.articles);
    return Promise.reduce(articles, function(articles, fArt) {
        articles.forEach(function(sArt) {
            fKey = utils.trimSpecialCharacters(fArt['title']);
            sKey = utils.trimSpecialCharacters(sArt['title']);
            if (fKey.indexOf(sKey) > -1 || sKey.indexOf(fKey) > -1) {
                sArt = utils.extendSmallestObject(fArt, sArt);
            } else {
                articles.push(fArt)
            }
        });

        return articles;
    }, []);
}

// HELPER FUNCTIONS
// ====================================================

function prepareForRanking(entityList) {
    var rank = {
        entities: entityList,
        rankingFields: [
            {   fields: ['articles','citedby-count'],
                multiplier: 1
            },
            {   fields: ['articles','pubmed-id'],
                multiplier: 1,
                weight: 20
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

