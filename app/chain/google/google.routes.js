/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var googleController = require('./google.controller');

module.exports = function(routes) {

    // fetch something from the controller
    routes.get('/apa', function(request, response) {
    	return googleController.getApa()
    		.then(response.send);
    });

    return routes;
};