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

exports.sortByField = function(list, field) {
    return new Promise(function(resolve) {
        list.sort(function(a, b) {
            if (a[field] < b[field]) {
                return -1;
            }
            return 1;
        });

        return resolve(list);
    });
}

exports.extractFieldValue = function(fieldList) {
    return function(value) {
        return new Promise(function(resolve) {
            fieldList.forEach(function(field) {
                value = value[field];
            });

            return resolve(value);
        });
    }
}

exports.sameEntityFilter = function(list) {
    return new Promise(function(resolve) {
        list.sort(function(a,b) {
            if (a['prism:url'] < b['prism:url']) {
                return -1;
            }
            return 1;
        });
        for (var i = 0; i < list.length-1; i++) {
            if (list[i]['prism:url'] === list[i+1]['prism:url']) {
                console.log("We got a double! " + i)
            }
        };
        return resolve(list);
    });
}

exports.extractFieldForObject = function(field) {
    return function(obj) {
        return obj[field];
    }
}
