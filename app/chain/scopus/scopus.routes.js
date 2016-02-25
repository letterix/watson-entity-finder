/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var scopusController = require('./scopus.controller');

module.exports = function(routes) {
    routes.get('/:search', function(request, response) {
        scopusController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};

module.exports = function(routes) {
    routes.get('/author/', function(request, response) {
        scopusController.authorSearch()
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};

module.exports = function(routes) {
    routes.get('/retrieveAuthor/', function(request, response) {
        scopusController.retrieveAuthor()
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};