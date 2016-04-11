/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var wosResource = require('./wos.resource');
var errorHandler = require('../../handler/error.handler.js');
var xml = require('xml');

// DOES EXPORT
// ====================================================

exports.search = function() {

    var xmlObject = [ {
        'soapenv:Envelope': [ 
        {   '_attr': { 
                'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/', 
                'xmlns:auth': 'http://auth.cxf.wokmws.thomsonreuters.com'
            }
        },
        {   'soapenv:Header': {}
        },
        {   'soapenv:Body': [ {
                'auth:authenticate': {}
            } ] 
        } ]
    } ];

//    var xmlObject = [];
//    xmlObject.push()

    var options = {};

    var xmlString = xml(xmlObject, options);

     return wosResource.search(xmlString)
        .then(function(res) {
            return res['soap:Envelope']['soap:Body'][0]['ns2:authenticateResponse'][0]['return'][0];
        });
};
