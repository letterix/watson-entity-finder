/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var tradeoffController = require('./tradeoff.controller');

module.exports = function(routes) {

    routes.get('', function(request, response) {
		console.log("tradeoff");
        tradeoffController.getDilemmas()
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
