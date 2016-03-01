/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var request = require('request-promise');
var Promise = require('bluebird');
var config = require('config');
var responseHandler = require('../../handler/response.handler');
var errorHandler = require('../../handler/error.handler');
var utils = require('../../utility/utils');

var scidirSearchUrl = config.RESOURCE_SCIDIR_SEARCH_URL;
var apiKey = config.RESOURCE_SCOPUS_API_KEY;

exports.search = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: scidirSearchUrl,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};