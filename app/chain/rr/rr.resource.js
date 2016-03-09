/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var request = require('request-promise');
var Promise = require('bluebird');
var config = require('config');
var responseHandler = require('../../handler/response.handler');
var errorHandler = require('../../handler/error.handler');
var utils = require('../../utility/utils');
var watson = require('watson-developer-cloud');

var username = config.RESOURCE_RR_USERNAME;
var password = config.RESOURCE_RR_PASSWORD;

var clusterID = config.RESOURCE_RR_CLUSTER_ID;
var rankerID =  config.RESOURCE_RR_RANKER_ID;

var retrieve_and_rank = watson.retrieve_and_rank({
  username: username,
  password: password,
  version: 'v1'
});

exports.createCluster = function(clusterName) {
    return new Promise(function (resolve, reject) {
        return retrieve_and_rank.createCluster({
            cluster_size: '1',
            cluster_name: clusterName
        },
        function (err, response) {
            if (err) {
                console.log('error:', err);
                return reject(err);
            }
            return resolve(response);
        })
    });
}

exports.listClusters = function() {
    return new Promise(function (resolve, reject) {
        return retrieve_and_rank.listClusters({}, function(err, response) {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    });
};

exports.clusterStatus = function(cluster_id) {
    return new Promise(function (resolve, reject) {
        return retrieve_and_rank.pollCluster({
            cluster_id: cluster_id
        }, function(err, response) {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    });
};

exports.deleteCluster = function(cluster_id) {
    return new Promise(function (resolve, reject) {
        return retrieve_and_rank.deleteCluster({
            cluster_id: cluster_id
        }, function(err, response) {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    });
};

exports.rankerStatus = function(ranker_id) {
    return new Promise(function (resolve, reject) {
        return retrieve_and_rank.rankerStatus({
            ranker_id: ranker_id
        }, function(err, response) {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    });
}
