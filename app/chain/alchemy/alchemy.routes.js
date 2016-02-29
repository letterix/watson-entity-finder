/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var alchemyController = require('./alchemy.controller');

module.exports = function(routes) {

    // This just a hard coded test
    routes.get('/:url', function(request, response) {
        alchemyController.getEntities(request.params.url)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
