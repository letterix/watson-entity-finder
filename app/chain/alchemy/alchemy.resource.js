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
var utils  = require('../../utility/utils');

var url = config.RESOURCE_ALCHEMY_URL;
var textUrl = config.RESOURCE_ALCHEMY_TEXT_URL;

exports.getEntitiesByUrl = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri : url,
        method: 'GET',
        json: true,
        gzip: true
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);

};

exports.getEntitiesByText = function(params) {
    var options = {
        resolveWithFullResponse: true,
        uri : textUrl,
        method: 'POST',
        form: params,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePost)
        .catch(errorHandler.throwResourceError);

};


