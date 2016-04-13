/*eslint-env node */
'use strict';

/**
 * Module dependencies.
 */
var Promise = require('bluebird');
var wosResource = require('./wos.resource');
var errorHandler = require('../../handler/error.handler.js');
var xml = require('xml');
var sid = '';
// DOES EXPORT
// ====================================================

exports.authenticate = function() {

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

     return wosResource.authenticate(xmlString)
        .then(function(res) {
          return res['soap:Envelope']['soap:Body'][0]['ns2:authenticateResponse'][0]['return'][0];
        });
};

exports.search = function() {
      var xmlObject = [ {
          'soapenv:Envelope': [
          {   '_attr': {
                  'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
                  'xmlns:woksearchlite': 'http://woksearchlite.v3.wokmws.thomsonreuters.com'
              }
          },
          {   'soapenv:Header': {}
          },
          {   'soapenv:Body': [ {
                  'woksearchlite:search': [
                    {'queryParameters': [
                          {'databaseId':'WOS'},
                          {'userQuery':'TS=Cancer'},//Put search parameters here
                          {'queryLanguage':'en'}//Try omitting this line if you are feeling adventureous
                          ]
                    },
                    {'retrieveParameters': [
                          {'firstRecord':'1'},//The first record to return. Only 100 records can be returned with each search.
                          {'count':'5'},    //The number of records to return. Should probably be kept at 100.
                          ]
                    },
                  ] }
              ]
          }
        ] }
      ];
      var options = {};
      var xmlString = xml(xmlObject, options);

       return wosResource.search(xmlString)
          .then(function(res) {
              return res;//What should be extracted and to which format?
          });
  };
