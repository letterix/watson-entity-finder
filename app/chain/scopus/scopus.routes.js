/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var scopusController = require('./scopus.controller');

module.exports = function(routes) {
    routes.get('/search/:search', function(request, response) {
        scopusController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    }); 

    routes.get('/author/', function(request, response) {
        scopusController.authorSearch('AUTHLASTNAME(King)%20and%20AUTHFIRST(W)%20and%20AFFIL(University)%20and%20AFFIL(Queensland)%20and%20AFFIL(Bishop%27s)')
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAuthor/', function(request, response) {
        scopusController.retrieveAuthor('56218921200')
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/retrieveAbstract/', function(request, response) {
        scopusController.retrieveAbstract('10.1016/j.anbehav.2015.12.020')
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};