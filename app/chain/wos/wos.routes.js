/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var wosController = require('./wos.controller');

module.exports = function(routes) {

    // This just a hard coded test
    routes.get('/', function(request, response) {
        wosController.authenticate()
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};
