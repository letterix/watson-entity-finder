/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var responseHandler = require('../../handler/response.handler');
var rrController = require('./rr.controller');

module.exports = function(routes) {

    routes.get('/search/:search', function(request, response) {
        return rrController.search(request.params.search)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/createCluster/:clusterName', function(request, response) {
        return rrController.createCluster(request.params.clusterName)
            .then(responseHandler.sendJsonResponse(response))
            .catch(responseHandler.sendErrorResponse(response));
    });

    routes.get('/listClusters', function(request, response) {
        return rrController.listClusters() 
            .then(function(res) {
            	return response.send(res);
            })
            .catch(responseHandler.sendErrorResponse(response)); 
    });

    routes.get('/clusterStatus', function(request, response) {
        return rrController.clusterStatus() 
            .then(function(res) {
            	return response.send(res);
            })
            .catch(responseHandler.sendErrorResponse(response)); 
    });

    routes.get('/deleteCluster/:cluster_id', function(request, response) {
        return rrController.deleteCluster(request.params.cluster_id) 
            .then(function(res) {
            	return response.send(res);
            })
            .catch(responseHandler.sendErrorResponse(response)); 
    });

    routes.get('/rankerStatus/:ranker_id', function(request, response) {
        return rrController.rankerStatus(request.params.ranker_id) 
            .then(function(res) {
            	return response.send(res);
            })
            .catch(responseHandler.sendErrorResponse(response));
    });

    return routes;
};


