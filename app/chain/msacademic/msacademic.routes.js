/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var msController = require('./msacademic.controller');

module.exports = function(routes) {
    routes.get('/:search', function(request, response) {
        msController.search(request.params.search, 20)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
  });

    return routes;
};
