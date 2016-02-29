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
    routes.get('/author/:search', function(request, response) {
        scopusController.authorSearch(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};

module.exports = function(routes) {
    routes.get('/retrieveAuthor/:id', function(request, response) {
        scopusController.retrieveAuthor(request.params.id, request.query.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};

module.exports = function(routes) {
    routes.get('/retrieveAbstract/:title', function(request, response) {
        scopusController.retrieveAbstract(request.params.title, request.query.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
