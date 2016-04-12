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

var authUrl = 'http://search.webofknowledge.com/esti/wokmws/ws/WOKMWSAuthenticate?wsdl';
var searchUrl = 'http://search.webofknowledge.com/esti/wokmws/ws/WokSearchLite?wsdl';

exports.authenticate = function(xml) {
    var options = {
        resolveWithFullResponse: true,
        uri : authUrl,
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
        uri : searchUrl,
        method: 'POST',
        headers: {
            'Cookie':'SID="W8lWR1Z2njc93c4Sf8z"',
            'content-type': 'application/xml;charset=UTF-8'
        },
        form: xml,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePostXml)
        .catch(errorHandler.throwResourceError);
};
