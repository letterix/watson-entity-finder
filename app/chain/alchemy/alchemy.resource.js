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
var apikey = config.RESOURCE_ALCHEMY_API_KEY;

exports.get = function() {
    var options = {
        resolveWithFullResponse: true,
        uri : url,
        //uri: url + '?' + 'apiKey=' + apikey + '&outputMode=json' + '&url=' + url,
        method: 'GET',
        json: true,
        gzip: true
    };

    var params = {
        "url": "https://en.wikipedia.org/wiki/Steve_Jobs",
        "apikey": apikey,
        "outputMode": "json"
    };

    return utils.setUrlParamsForOptions(params, options)
        .then(request)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwResourceError);

};
