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

var authUrl = config.RESOURCE_WOS_AUTH_URL;
var searchUrl = config.RESOURCE_WOS_SEARCH_URL;
var soapAuthUrl = config.RESOURCE_WOS_SOAP_AUTH;
var soapEnv = config.RESOURCE_WOS_SOAPENV;

var sid = '';

// DOES EXPORT
// ====================================================

exports.search = function(soapString) {
    var options = {
        resolveWithFullResponse: true,
        uri : searchUrl,
        method: 'POST',
        headers: {
            'Cookie':'SID='+sid,
            'content-type': 'text/xml;charset=UTF-8'
        },
        form: soapString,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePostXml)
        .catch(function(response){
          return tryAgain(options, response);
        })
        .catch(errorHandler.throwResourceError);
};

// DOES NOT EXPORT
// ====================================================

function tryAgain(options, response){
    return new Promise(function(resolve, reject){
      if(response.statusCode === 500){
        return resolve(authAndSearch(options));
      }
      return reject(response);
    });
}

function authAndSearch(searchOptions) {
      var soapAuthMessage = [{
          'soapenv:Envelope': [
            { '_attr': {
                  'xmlns:soapenv': soapEnv,
                  'xmlns:auth': soapAuthUrl
              }
            },
            { 'soapenv:Header': {}
            },
            { 'soapenv:Body': [{
                  'auth:authenticate': {}
              }]
            }
          ]
      }];

      var soapString = xml(soapAuthMessage, {});

      var authOptions = {
          resolveWithFullResponse: true,
          uri : authUrl,
          method: 'POST',
          headers: {
              'content-type': 'text/xml;charset=UTF-8'
          },
          form: soapString,
          gzip: true
      };

      return request(authOptions)
          .then(responseHandler.parsePostXml)
          .then(function(res) {
              sid = res['soap:Envelope']['soap:Body'][0]['ns2:authenticateResponse'][0]['return'][0];
              searchOptions.headers['Cookie']='SID='+sid;
              return request(searchOptions)
                .then(responseHandler.parsePostXml);
          })
          .catch(errorHandler.throwResourceError);
}
