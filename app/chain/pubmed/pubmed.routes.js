/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var pubmedController = require('./pubmed.controller');

module.exports = function(routes) {
    routes.get('/:searchPMID/:search', function(request, response) {
        pubmedController.searchPMID(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAbstract/:pmid', function(request, response) {
        pubmedController.retrieveAbstract(request.params.pmid)
            .then(responseHandler.sendTextResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
