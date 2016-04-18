/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var scopusController = require('./scopus.controller');

module.exports = function(routes) {
    routes.get('/:search', function(request, response) {
        scopusController.search(request.params.search, 0, 2)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/author/:search', function(request, response) {
        scopusController.authorSearch(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAuthor/:id', function(request, response) {
        scopusController.retrieveAuthor(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAbstract/:title', function(request, response) {
        scopusController.retrieveAbstract(request.params.title)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveArticle/:eid', function(request, response) {
        scopusController.retrieveArticle(request.params.eid)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveIssn/:issn', function(request, response) {
        scopusController.retrieveIssn(request.params.issn)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

// Routes with post work
// ====================================================

    routes.get('/searchArticles/:search', function(request, response) {
        scopusController.searchArticles(request.params.search, request.query.numRes)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });
/*
    routes.get('/getTradeoff/:search', function(request, response) {
        scopusController.getTradeoff(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });
*/
    routes.get('/loopSearch/:search', function(request, response) {
        scopusController.loopSearch(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
