/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');

/**
 * options: the options object needed for request-promise
 * params: the parameters object to be passed as url params
 */
exports.setUrlParamsForOptions = function(params, options) {
    return new Promise.reduce(Object.keys(params), function(acc, param) {
        return acc + encodeURIComponent(param)+ '=' + encodeURIComponent(params[param]) + '&';
    }, options.uri + '?')
    .then(function(res) {
        options.uri = res;
        return options;
    })
};

exports.extractValuesFromMap = function(map) {
  return Promise.map(Object.keys(map), function(key) {return map[key]});
}


// HELPER FUNCTIONS
exports.printChain = function(res) {
    console.log(res);
    return res;
};

exports.replaceAll = function(string, find, replace) {
    return string.split(find).join(replace);
};
