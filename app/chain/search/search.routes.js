/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var searchController = require('./search.controller');

module.exports = function(routes) {

    // fetch something from the controller
    routes.get('/:search', function(request, response) {
        return searchController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
