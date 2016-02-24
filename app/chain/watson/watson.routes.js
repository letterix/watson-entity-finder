/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var watsonController = require('./watson.controller');

module.exports = function(routes) {

    // fetch something from the controller
    routes.get('/:id', function(request, response) {
        watsonController.getNormalPromise(request.params.id)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};