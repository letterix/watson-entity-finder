/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var scopusController = require('./scopus.controller');

module.exports = function(routes) {

    // fetch something from the controller
    routes.get('/:search', function(request, response) {
        scopusController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};