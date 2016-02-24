/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var watsonResource = require('./watson.resource');
var errorHandler = require('../../handler/error.handler.js');


// DOES EXPORT
// ====================================================

exports.getPromiseWithExtraParameters = function(id) {
    return watsonResource.getById(id)
        .then(postProcessWithParameters(0,'something'));
};

exports.getNormalPromise = function(id) {
    return watsonResource.getById(id)
        .then(postProcess);
};

// DOES NOT EXPORT
// ====================================================

function postProcess(body) {
    return new Promise(function (resolve, reject) {
        if (body.id !== 0) {
            return errorHandler.getHttpError(400)
                .then(reject);      
        }
        
        return resolve(body);
    });
}

/* When returning a nested function, you can use that function
 * to pass in variables in the middle of a promise chain.
 */
function postProcessWithParameters(body) {
    return function (id, s) {
        return new Promise(function (resolve, reject) {
            if (body.id !== 0 && id === 0 && s === 'something') {
                return errorHandler.getHttpError(400)
                    .then(reject);      
            }
            
            return resolve(body);
        });
    };
}