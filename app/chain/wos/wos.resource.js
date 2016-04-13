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
var xml = require('xml');

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
            'content-type': 'text/xml;charset=UTF-8'
        },
        form: xml,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePostXml)
        .catch(function(response){
          return tryAgain(options, response);
            })
        .catch(errorHandler.throwResourceError);
};

function authAndSearch(searchOptions) {
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
      var xmlOptions = {};
      var xmlString = xml(xmlObject, xmlOptions);
      var authDetails = {
          resolveWithFullResponse: true,
          uri : authUrl,
          method: 'POST',
          headers: {
              'content-type': 'text/xml;charset=UTF-8'
          },
          form: xmlString,
          gzip: true
      };
      console.log("we are in authAndSearch");
      return request(authDetails)
          .then(responseHandler.parsePostXml)
          .then(function(res) {
              sid = res['soap:Envelope']['soap:Body'][0]['ns2:authenticateResponse'][0]['return'][0];
              searchOptions.headers['Cookie']='SID='+sid;
              console.log(sid);
              return request(searchOptions)
                .then(responseHandler.parsePostXml);
          })
          .catch(errorHandler.throwResourceError);
}

function tryAgain(options, response){
    return new Promise(function(resolve, reject){
      if(response.statusCode === 500){
        return resolve(authAndSearch(options));
      }
      console.log("The error code was not 500");
      return reject(response);
    });
}

/*function checkIfSidError(response) {
  console.log("Checking for siderror");
    return new Promise(function(resolve, reject){
      if(response.statusCode === 500){
        console.log("We got 500!");
        return resolve(response);
      }
      console.log("The error code was not 500");
      return reject;
    })
}*/
