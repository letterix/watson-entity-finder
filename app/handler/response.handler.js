/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var errorHandler = require('./error.handler');
var msg = require('./message.handler');
var config = require('config');
var xmlToJs = Promise.promisifyAll(require('xml2js'));


// PARSING
// ============================================================================

exports.parseDelete = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(204))
        .then(parseBody);
};

exports.parsePost = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(200))
        .then(parseBody);
};

exports.parsePostXml = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(200))
        .then(parseBodyXml);
};

exports.parsePut = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(204))
        .then(parseBody);
};

exports.parseGet = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(200))
        .then(parseBody);
};

exports.parseGetText = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(200))
        .then(parseTextBody);
};

exports.parseGetPolyQuery = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(200))
        .then(parsePolyQuery);
};

exports.parseGetMonoQuery = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(200))
        .then(parseMonoQuery);
};

exports.parsePostIndex = function(response) {
    return checkResponse(response)
        .then(checkStatusCode(201));
};

function checkResponse(response) {
    return new Promise(function(resolve, reject) {
        if (!response) {
            return errorHandler.getHttpError(406)
                .then(reject);
        }

        return resolve(response);
    });
}

function checkStatusCode(code) {
    return function(response) {
        return new Promise(function(resolve, reject) {
            if (response.statusCode === code) {
                return resolve(response);
            }

            return errorHandler.getHttpError(response.statusCode)
                .then(reject);
        });
    };
}

function parsePolyQuery(response) {
    return new Promise(function(resolve) {
        var items = JSON.parse(response.body) || [];
        return resolve(items);
    });
}

function parseMonoQuery(response) {
    return new Promise(function(resolve, reject) {
        parsePolyQuery(response)
            .then(function(items) {
                var item = (items.length > 0) ? items[0] : null;
                if (item) {
                    return resolve(item);
                } else {
                    return errorHandler.getHttpError(404)
                        .then(reject);
                }
            });
    });
}

function parseBody(response) {
    return new Promise(function(resolve) {
        var body = response.body || {};
        if (typeof body === 'string') {
            body = JSON.parse(body) || null;
        }
        return resolve(body);
    });
}

function parseBodyXml(response) {
    var body = response.body || '{}';
    return xmlToJs.parseStringAsync(body);
}

function parseTextBody(response) {
    return new Promise(function(resolve) {
        var body = response.body || "";
        return resolve(body);
    });
}

// SENDING
// ============================================================================
exports.sendErrorResponse = function(response) {
    return function(error) {
        response.status(error.status || 500).send(error.message);
    };
};

exports.sendUnauthorizedResponse = function(response) {
    return function() {
        return errorHandler.getHttpError(401)
            .then(exports.sendErrorResponse(response));
    };
};

exports.sendToNext = function(next) {
    return function() {
        next();
    };
};

exports.sendJsonResponse = function(response) {
    return function(object) {
        return response.json(object);
    };
};

exports.sendTextResponse = function(response) {
    return function(object) {
        return response.send(object);
    };
};

exports.sendSuccessfulDeleteJsonResponse = function(response) {
    return function() {
        return response.send(msg.SUCCESS_DELETE);
    };
};

exports.sendSuccessfulPutJsonResponse = function(response) {
    return function() {
        return response.send(msg.SUCCESS_UPDATE);
    };
};

exports.sendSuccessUploadJsonResponse = function(response) {
    return function(file) {
        return response.send(file._id);
    };
};

exports.sendFileResponse = function(response) {
    return function(file) {
        response.download(config.UPLOAD_PATH + file.generatedName);
    };
};

exports.sendThumbnailResponse = function(response) {
    return function(stream) {
        response.setHeader('Content-type', 'image/png');
        stream.pipe(response);
    };
};
