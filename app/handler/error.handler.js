/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var msg = require('./message.handler');

exports.getHttpError = function(statusCode) {
    return new Promise(function(resolve) {
        var error = new Error();
        error.status = statusCode;
        error.httpError = true;
        switch (statusCode) {
            case 400:
                error.message = msg.INVALID_JSON_OBJECT;
                break;
            case 401:
                error.message = msg.UNAUTHORIZED;
                break;
            case 404:
                error.message = msg.NO_SUCH_ITEM;
                break;
            case 406:
                error.message = msg.INVALID_RESPONSE;
                break;
            case 413:
                error.message = msg.FILE_TOO_LARGE;
                break;
            case 415:
                error.message = msg.BAD_FILE_FORMAT;
                break;
            case 500:
                error.message = msg.FAILED_HTTP;
                break;
            default:
                error.message = msg.UNEXPECTED_STATUS + statusCode;
                break;
        }
        return resolve(error);
    });
};

exports.throwDREAMSHttpError = function(response) {
    return new Promise(function(resolve, reject) {
        if (response.httpError) {
            return reject(response);
        } else {
            response.message = response.message.substring(6, response.message.length);
            response.status = response.statusCode;
            return reject(response);
        }
    });
};