/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var pubmedController = require('./pubmed.controller');

module.exports = function(routes) {
    routes.get('/getPubmedIDs/:search', function(request, response) {
        pubmedController.getPubmedIDs(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/searchDoi/:search', function(request, response) {
        pubmedController.searchDoi(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAbstract/:pmid', function(request, response) {
        pubmedController.retrieveAbstract(request.params.pmid)
            .then(responseHandler.sendTextResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAbstractText/:pmid', function(request, response) {
        pubmedController.retrieveAbstractText(request.params.pmid)
            .then(responseHandler.sendTextResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/author/:search', function(request, response) {
        pubmedController.authorSearch(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAuthors/:search', function(request, response) {
        pubmedController.retrieveAuthors(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveIssn/:search', function(request, response) {
        pubmedController.retrieveIssn(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveDoi/:search', function(request, response) {
        pubmedController.retrieveDoi(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
