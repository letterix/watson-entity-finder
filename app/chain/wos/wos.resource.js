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
var wosController = require('./wos.controller');

var authUrl = 'http://search.webofknowledge.com/esti/wokmws/ws/WOKMWSAuthenticate?wsdl';
var searchUrl = 'http://search.webofknowledge.com/esti/wokmws/ws/WokSearchLite?wsdl';
var sid = '';

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
            'Cookie':'SID='+sid,
            'content-type': 'application/xml;charset=UTF-8'
        },
        form: xml,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePostXml)
        .catch(checkIfSidError)
        .then(function(response){
          sid = wosController.authenticate();
          options.headers["'Cookie'"] = 'SID='+sid;
          return request(options)
              .then(responseHandler.parsePostXml)
              .catch(errorHandler.throwResourceError);
        });
};

function authenticate() {
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
      var options = {};
      var xmlString = xml(xmlObject, options);

       sid = wosResource.authenticate(xmlString)
          .then(function(res) {
              return res['soap:Envelope']['soap:Body'][0]['ns2:authenticateResponse'][0]['return'][0];
          });
  };
}



function checkIfSidError(response) {
    return new Promise(function(resolve, reject){
      if(response.statusCode === 500){
        return resolve(response);
      }
      return reject;
    })
}
