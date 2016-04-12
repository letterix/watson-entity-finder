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


// HELPER FUNCTIONS
exports.printChain = function(res) {
    console.log(res);
    return res;
};

exports.replaceAll = function(string, find, replace) {
    return string.split(find).join(replace);
};

exports.undefinedFilter = function(result) {
    return !!result;
}

exports.undefinedFieldFilter = function(field) {
    return function(res) {
        return !!res[field];
    }
}

exports.setFieldForObject = function(field, object) {
    return function(res) {
        object[field] = res;
        return object;
    }
}
