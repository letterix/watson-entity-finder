/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');

/**
 * options: the options object needed for request-promise
 * params: the parameters to be passed as url params
 */
exports.setUrlParamsForOptions = function(params, options) {
    return new Promise.reduce(Object.keys(params), function(acc, param) {
        return acc + param + '=' + params[param] + '&';
    }, options.uri + '?')
    .then(function(res) {
        options.uri = res;
        return options;
    })
};
