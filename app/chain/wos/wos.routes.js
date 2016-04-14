/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var wosController = require('./wos.controller');

module.exports = function(routes) {
    routes.get('/:search', function(request, response) {
        wosController.search()
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });


    return routes;
};
