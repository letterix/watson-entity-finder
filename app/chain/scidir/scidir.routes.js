/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var scidirController = require('./scidir.controller');

module.exports = function(routes) {
    routes.get('/:search', function(request, response) {
        scidirController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveFullText/:pii', function(request, response) {
        scidirController.retrieveFullText(request.params.pii)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
