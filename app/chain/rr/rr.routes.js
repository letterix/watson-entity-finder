/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var rrController = require('./rr.controller');

module.exports = function(routes) {

    // fetch something from the controller
    routes.get('/:search', function(request, response) {
        return rrController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
