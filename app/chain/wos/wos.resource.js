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

var url = 'http://search.webofknowledge.com/esti/wokmws/ws/WOKMWSAuthenticate?wsdl';

exports.authenticate = function(xml) {
    var options = {
        resolveWithFullResponse: true,
        uri : url,
        method: 'POST',
        headers: {
            'content-type': 'text/xml;charset=UTF-8'
        },
        form: xml,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePostXml)
        .catch(errorHandler.throwResourceError);
};

exports.search = function(xml) {
    var options = {
        resolveWithFullResponse: true,
        uri : url,
        method: 'POST',
        headers: {
            'content-type': 'text/xml;charset=UTF-8'
        },
        form: xml,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePostXml)
        .catch(errorHandler.throwResourceError);
};
