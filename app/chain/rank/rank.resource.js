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

var rankUrl = config.RESOURCE_RANK_URL;

exports.rank = function(data, params) {
    var options = {
        resolveWithFullResponse: true,
        uri: rankUrl,
        method: 'POST',
        json: data,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .catch(function(err) {
            console.log(err);
        })
        .then(responseHandler.parsePost)
        .catch(errorHandler.throwResourceError);
};

