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

var msacademicSearchUrl = config.RESOURCE_MSACADEMIC_SEARCH_URL;
var apiKey = config.RESOURCE_MSACADEMIC_API_KEY;

exports.search = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri: msacademicSearchUrl,
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey
        },
        json: true,
        gzip: true
    };
    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);
};
