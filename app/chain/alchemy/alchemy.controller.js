/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var alchemyResource = require('./alchemy.resource');
var errorHandler = require('../../handler/error.handler.js');

// DOES EXPORT
// ====================================================

exports.getEntities = function(url) {
    var params = {
        "url": url,
        "apikey": "9da318e13054c45454b95f3d9db450041f69a507",
        "outputMode": "json"
    };

    return alchemyResource.getEntitiesByUrl(params);
};

exports.getEntitiesByText = function(text) {
    var params = {
        "apikey": "9da318e13054c45454b95f3d9db450041f69a507",
        "outputMode": "json",
        "text": text
    };

    return alchemyResource.getEntitiesByText(params);
};
