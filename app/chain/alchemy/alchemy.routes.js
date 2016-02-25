/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var alchemyController = require('./alchemy.controller');

module.exports = function(routes) {

    // fetch something from the controller
    routes.get('/', function(request, response) {
        alchemyController.get()
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};